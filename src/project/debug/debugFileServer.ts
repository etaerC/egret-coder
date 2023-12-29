import * as vscode from 'vscode';
import * as http from 'http';
const StaticServer = require('static-server');

/**
 * 调试功能中所使用的静态服务器
 */
export class DebugFileServer {
    private port = 8080;
    private _server = null;
    private serverRunning = false;

    public getPortString(): string {
        return this.port.toString();
    }

    private getAvailablePort(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const server = http.createServer();
            server.listen(this.port);
            server.on('listening', () => {
                this.port = server.address().port;
                server.close();
                resolve(this.port);
            });
        });
    }

    private getServer() {
        if (this._server !== null) {
            this._server.port = this.port;
            return this._server;
        }
        const _rootPath = vscode.workspace.rootPath;
        const myStaticServer = new StaticServer({
            rootPath: _rootPath,
            port: this.port,
            name: 'egret-server',
            host: 'localhost',
            cors: '*',
            followSymlink: true,
            templates: {
                index: 'index.html'
            }
        });
        this._server = myStaticServer;
        this._server.on('request', function (req, res) {
            // 断点续传有bug，强制转换为非断点续传
            delete req.headers.range
          });
        return this._server;
    }

    public async startServer(cfg: vscode.DebugConfiguration): Promise<void> {
        const url = cfg.url as string;
        if (url) {
            let ret = url.match(/:(\d+)/); // 比如 url = "http://localhost:8999"， 返回 ret = [":8999", "8999"]
            if (ret && ret[1])
                this.port = parseInt(ret[1]);
        }
        return new Promise<void>( async (resolve, reject) => {
            if (this.serverRunning) {
                resolve();
                return;
            }
            await this.getAvailablePort();
            this.getServer().start(() => {
                this.serverRunning = true;
                resolve();
            });
        });
    }

    public async stopServer(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getServer().stop(() => {
                this.serverRunning = false;
                resolve();
            });
        });
    }

}