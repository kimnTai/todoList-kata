import http from "http";
import headers from "./headers";
import Todo from "./model/todo";

const successHandle = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const result = await Todo.find();
    res.writeHead(200, headers);
    res.write(JSON.stringify({ status: "success", data: result }));
    res.end();
};

const errorHandle = (req: http.IncomingMessage, res: http.ServerResponse, message: string) => {
    res.writeHead(400, headers);
    res.write(JSON.stringify({ status: "error", message }));
    res.end();
};

export { successHandle, errorHandle };
