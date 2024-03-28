import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as opn from 'opn';
import { EgretConst } from '../egret';
import { tr } from '../i18n';
import { EgretWebsite } from '../launcher/launcherDefines';
import Launcher from '../launcher/launcher';
import * as path from 'path';
import * as fs from 'fs';
import { Project } from './project';

enum EgretCommand {
    Build = 'build',
    Clear = 'clean',
    Run = 'run',
}

/**
 * 调用引擎的命令行工具: egret [command]
 *
 * egret 这个命令行工具并非引擎提供, 而是 launcher 提供
 *
 * - 首先判断 launcher 是否安装, 如果已经安装就可以尝试调用
 * - 如果 launcher 安装但是引擎没有安装, egret 命令会正确的返回引擎没有安装的输出信息
 *
 */
export class Command {
    private static readonly EGRET_COMMAND: string = 'egret';
    private static _channel: vscode.OutputChannel;

    public static async build(): Promise<void> {
        await this.runCommand(EgretCommand.Build, ()=>{
            // -------------
            // 编译完成后，删除多出的 scripts\plugins\node_modules\@egret 文件夹。 否则以后使用 EgretWing 打开时，编辑不了皮肤。
            // （使用白鹭引擎 5.4.1 编译后，会有这种问题。—— 很可能 EgretWing 都过时，都不支持 5.4.1 了。
            // （因为使用独立的 eui 软件编辑皮肤时，总是卡死。 —— 所以还是使用 EgretWing 编辑皮肤比较稳定。 
            // -------------
            let tegret = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "scripts", "plugins", "node_modules", "@egret");
            if (fs.existsSync(tegret)) {
                Project.MyDeleteFolder(tegret, { tips: true });
            }
            // -------------
        });
    }

    public static async clean(): Promise<void> {
        await this.runCommand(EgretCommand.Clear);
    }

    public static async run(): Promise<void> {
        await this.runCommand(EgretCommand.Run);
    }

    private static async runCommand(command: string, callback?: (error, stdout,stderr) => void): Promise<void> {
        try {
            const installed = await this.checkLauncherInstalled();
            if (!installed) { return; }
            const workspaceRoot = vscode.workspace.rootPath;
            let status = cp.exec(`${this.EGRET_COMMAND} ${command}`, { cwd: workspaceRoot }, callback);
            status.stdout.on('data', (data) => {
                this.showOutput(data);
            });
            status.stderr.on('data', (data) => {
                this.showOutput(data);
            });
        } catch (error) {
            this.showOutput(error);
        }
    }

    private static showOutput(data) {
        const out = this.getOutputChannel();
        out.show(true);
        out.append(data);
    }

    private static async checkLauncherInstalled(): Promise<boolean> {
        const curVersion = await Launcher.getEgretLauncherVersionAsync();
        if (!curVersion) {
            this.promptNoLauncher();
            return false;
        }
        return true;
    }

    private static getOutputChannel(): vscode.OutputChannel {
        this._channel = this._channel || vscode.window.createOutputChannel(EgretConst.Tag);
        return this._channel;
    }

    private static promptNoLauncher() {
        const msgGoto = tr('Engine', 'Go to download at official website：{0}', EgretWebsite);
        vscode.window.showInformationMessage(tr('Engine', tr('Engine', 'Please install Egret Launcher')), msgGoto)
            .then(t => {
                if (t === msgGoto) { opn(EgretWebsite); }
            });
    }
}