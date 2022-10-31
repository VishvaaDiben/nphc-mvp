import { Button, Input, Modal } from "antd";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import CSVReader from "./CsvParser/index";
import React from "react";

afterEach(cleanup);

const defaultProps = {
  onClick: jest.fn(),
};

describe("CSVReader", () => {
  // test("button renders with correct text", () => {
  //   const { queryByText, rerender } = render(<Button {...defaultProps} />);
  //   expect(queryByText("Upload")).toHaveProperty("disabled", true);
  // });

  test("calls correct function on click", () => {
    const onClick = jest.fn();
    const { getByTestId } = render(
      <Button data-testid="upload" onClick={onClick} />
    );
    fireEvent.click(getByTestId("upload"));
    expect(onClick).toHaveBeenCalled();
  });

  test("should render csv file input element", async () => {
    const { container, getByTestId } = render(<CSVReader data-testid="fileUpload" />);
    fireEvent.click(getByTestId("fileUpload"));
  });
});
