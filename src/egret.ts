export { EgretConst, EgretExtensionCommand };

enum EgretConst {
    Tag = 'Egret',
}

enum EgretExtensionCommand {
    MyDebugWithoutBuild = 'extension.MyDebugWithoutBuild',
    Build = 'extension.egretBuild',
    Run = 'extension.egretRun',
    Clean = 'extension.egretClean',
    Create = 'extension.egretCreate',
    Publish = 'extension.egretPublish',
    OpenFile = 'extension.egretOpenFile',
    Server = 'extension.egretServer',
    GetWebsitePort = 'extension.getWebsitePort',
    OpenEUIProject = 'extension.egretOpenEUIProject',
    EXmlCursorBack = 'extension.egretEXmlCursorBack',
    EXmlInsertNamespace = 'extension.egretEXmlInsertNamespace',
    OpenEXmlInEui = 'extension.euiOpenExml'
}
