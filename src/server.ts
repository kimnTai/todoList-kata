import http from "http";
import mongoose from "mongoose";
import { errorHandle, successHandle } from "./handle";
import headers from "./headers";
import Todo from "./model/todo";

const requestListener = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.method === "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
        return;
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    await new Promise((resolve) => req.on("end", resolve));
    if (req.url === "/todo") {
        switch (req.method) {
            case "GET":
                successHandle(req, res);
                break;
            case "POST":
                try {
                    const { title } = JSON.parse(body);
                    await Todo.create({ title });
                    successHandle(req, res);
                } catch (error) {
                    errorHandle(req, res, "格式錯誤");
                }
                break;
            case "DELETE":
                await Todo.deleteMany({});
                successHandle(req, res);
                break;
            default:
                errorHandle(req, res, "無此方法");
                break;
        }
        return;
    }
    if (req.url?.startsWith("/todo/")) {
        const id = req.url.split("/").pop();
        switch (req.method) {
            case "PATCH":
                try {
                    const { title } = JSON.parse(body);
                    await Todo.findByIdAndUpdate(id, { title });
                    successHandle(req, res);
                } catch (error) {
                    errorHandle(req, res, "格式錯誤");
                }
                break;
            case "DELETE":
                const deleteResult = await Todo.findByIdAndDelete(id);
                if (deleteResult) {
                    successHandle(req, res);
                } else {
                    errorHandle(req, res, "無此 id");
                }
                break;
            default:
                errorHandle(req, res, "無此方法");
                break;
        }
        return;
    }

    errorHandle(req, res, "無此路由");
};

const server = http.createServer(requestListener);

import("dotenv/config").then(async () => {
    const { PORT, DATABASE, DATABASE_PASSWORD } = process.env;
    server.listen(PORT);
    console.log("伺服器啟動中");
    const url = DATABASE?.replace("<password>", DATABASE_PASSWORD as string) as string;
    await mongoose.connect(url);
    console.log("資料庫連線中");
});
