import "antd/dist/antd.css";

import { Button, Input, Modal, Table, notification } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { CSSProperties, useEffect, useState } from "react";

import { CSVReader } from "react-papaparse";
import axios from "axios";

export default function CSVParser() {
  //STATE
  const [isErr, setErr] = useState(false);
  const [msg, setMsg] = useState("");
  const [documentUploaded, setDocumentUpload] = useState(false);
  const [globalCsv, setGlobalCSV] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const columns = [
    {
      key: "1",
      title: "ID",
      dataIndex: "id",
      sorter: (record1, record2) => {
        return record1.id > record2.id;
      },
    },
    {
      key: "2",
      title: "Login",
      dataIndex: "login",
      sorter: (a, b) => a.login.length - b.login.length,
    },
    {
      key: "3",
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      key: "4",
      title: "Salary($)",
      dataIndex: "salary",
      sorter: (a, b) => a.salary - b.salary,
    },
    {
      key: "5",
      title: "Actions",
      render: (record) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                setIsEditing(true);
                setEditingEmployee(record);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                deleteRequest(record);
              }}
              style={{ color: "red", marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];

  //LOGIC
  const checkDuplicate = (results) => {
    const uniqueIDValues = new Set(results.map((v) => v.id));
    const uniqueLoginValues = new Set(results.map((v) => v.login));
    if (
      uniqueIDValues.size < results.length ||
      uniqueLoginValues.size < results.length
    ) {
      setErr(true);
      setDocumentUpload(false)
    } else {
      setErr(false);
      setMsg(
        "New entry detected as shown. Proceed to upload to server for latest record"
      );
      setGlobalCSV(results);
    }
  };

  const handleOnDrop = (data) => {
    setDocumentUpload(true);
    let content = data.map((result) => result.data);
    let combinedContent = [...globalCsv || "", ...content]
    checkDuplicate(combinedContent.flat());
  };

  const handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
  };

  const handleOnRemoveFile = (data) => {
    setDocumentUpload(false);
    setErr(false);
  };

  //API
  const getEmployees = () => {
    axios
      .get("http://localhost:3001/user/list")
      .then((resp) => {
        setGlobalCSV(resp.data.flat());
      })
      .catch(function (error) {
        console.log(error);
        if (error.code) {
          notification.error({
            message: error.name,
            description: error.message,
          });
        }
      });
  };

  const uploadEmployees = () => {
    axios
      .post("http://localhost:3001/user/add", globalCsv)
      .then(function (response) {
        return response.data;
      })
      .then(() => getEmployees())
      .catch(function (error) {
        console.log(error);
        if (error.code) {
          notification.error({
            message: error.name,
            description: error.message,
          });
        }
      });
  };

  const patchRequest = (record) => {
    const update = {
      id: record.id,
      login: record.login,
      name: record.name,
    };
    axios
      .patch(`http://localhost:3001/user/update/${record.id}`, update)
      .then((resp) => {
      })
      .then(() => getEmployees())
      .catch(function (error) {
        console.log(error);
        if (error.code) {
          notification.error({
            message: error.name,
            description: error.message,
          });
        }
      });
  };

  const deleteRequest = (record) => {
    Modal.confirm({
      title: "Are you sure, you want to delete this employee record?",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        axios
          .delete(`http://localhost:3001/user/delete/${record.id}`)
          .then((resp) => {
          })
          .then(() => getEmployees())
          .catch(function (error) {
            console.log(error);
            if (error.code) {
              notification.error({
                message: error.name,
                description: error.message,
              });
            }
          });
      },
    });
  };

  const resetEditing = () => {
    setIsEditing(false);
    setEditingEmployee(null);
  };

  useEffect(() => {
    getEmployees();
  }, []);

  useEffect(() => {
  }, [globalCsv, documentUploaded]);

  return (
    <>
      <h5>Click and Drag Upload</h5>
      <CSVReader
        onDrop={handleOnDrop}
        onError={handleOnError}
        addRemoveButton
        onRemoveFile={handleOnRemoveFile}
        config={{
          header: true,
          comments: true,
          skipEmptyLines: true,
          encoding: "ISO-8859-1",
        }}
        data-testid="fileUpload"
      >
        <span>Drop CSV file here or click to upload.</span>
      </CSVReader>
      {isErr && "duplicate id and login found"}
      {msg} <br />
      <Button
        type="primary"
        disabled={!documentUploaded}
        onClick={() => uploadEmployees()}
        data-testid="upload"
      >
        Upload
      </Button>
      <br />
      <hr />
      <br />
      <Table
        columns={columns}
        dataSource={globalCsv}
        rowKey="id"
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15"],
        }}
      ></Table>
      <Modal
        title="Edit Employee"
        visible={isEditing}
        okText="Save"
        onCancel={() => {
          resetEditing();
        }}
        onOk={() => {
          Modal.confirm({
            title: "Are you sure, you want to edit this employee record?",
            okText: "Yes",
            okType: "danger",
            onCancel: () => {
              resetEditing();
            },
            onOk: () => {
              patchRequest(editingEmployee);
              resetEditing();
            },
          });
        }}
      >
        <Input
          value={editingEmployee?.name}
          onChange={(e) => {
            setEditingEmployee((pre) => {
              return { ...pre, name: e.target.value };
            });
          }}
        />
        <Input
          value={editingEmployee?.login}
          onChange={(e) => {
            setEditingEmployee((pre) => {
              return { ...pre, login: e.target.value };
            });
          }}
        />
        <Input
          value={editingEmployee?.salary}
          onChange={(e) => {
            let val = e.target.value;

            if (!Number(val)) {
              return;
            }

            setEditingEmployee((pre) => {
              return { ...pre, salary: val };
            });
          }}
        />
      </Modal>
    </>
  );
}
