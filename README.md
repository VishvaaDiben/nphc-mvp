1.redirect to project folder and and run command "npm start" to start project
2.run command "npx json-server --watch .\src\db.json --port 4000" to start mock api json-server
3.db.json file need to be manually modified on the following:
a) when trying to edit/delete a record, need to remove the nested array. Else operation cannot traverse in the json object
note: a limitation in using mock api json-server, when doing upload only sends array of objects into already exisitng array resource (eg. employees=[])
4.to tun test, on same project folder, run command "npm test"
