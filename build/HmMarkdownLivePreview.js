/// <reference path="../types/hm_jsmode_strict.d.ts" />
/*
 * Copyright (c) 2023 Akitsugu Komiyama
 * under the MIT License
 */
hidemaruGlobal.showbrowserpane(1, 2);
// hidemaruGlobal.setbrowserpaneurl(hidemaru.getFileFullPath(), 2);
hidemaruGlobal.setbrowserpaneurl(hidemaruGlobal.currentmacrodirectory() + "\\webview2-markdown.html", 2);
var timerHandle = 0; // 時間を跨いで共通利用するので、varで
hidemaruGlobal.debuginfo(2);
function updateMethod() {
    if (hidemaru.isMacroExecuting()) {
        return;
    }
    /*
    if (isFileNameChanged()) {
        // console.log("isFileNameChanged\r\n")
        try {
            if (hidemaru.getFileFullPath() == "") {
                hidemaru.postExecMacroMemory(`setbrowserpaneurl "about:blank", 2;`);
            } else {
                hidemaru.postExecMacroMemory(`setbrowserpaneurl filename2, 2;`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    else */
    if (isCountUpdated()) {
        //  console.log("isCountUpdated\r\n")
        if (isTextUpdated()) {
            // console.log("isFileUpdated\r\n")
            try {
                // hidemaru.postExecMacroMemory(`jsmode @"WebView2\HmBrowserAutoUpdaterMain"; js {refreshbrowserpane(2);}`);
                var text = hidemaru.getTotalText();
                text = text.replaceAll("\\", "\\\\");
                text = text.replaceAll("\r\n", "\\n");
                text = text.replaceAll("\t", "\\t");
                text = text.replaceAll("\'", "\\'");
                var _a = getChangeYPos(), diff = _a[0], posY = _a[1], allLineCount = _a[2];
                var js = "javascript:mdrender('".concat(text, "', ").concat(posY, ")");
                var command = "setbrowserpaneurl R\"SETBROWSERPANEURL1(".concat(js, ")SETBROWSERPANEURL1\", 2;");
                hidemaru.postExecMacroMemory(command);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    else if (true) {
        var _b = getChangeYPos(), diff = _b[0], posY = _b[1], allLineCount = _b[2];
        if (allLineCount < 0) {
            allLineCount = 1;
        }
        if (diff && posY > 0 && allLineCount > 0) {
            /*
            if (posY < 15) { // 最初の行まであと10行程度なのであれば、最初にいる扱いにする。
                posY = 0;
            }
            if (allLineCount - posY < 15) {
                posY = allLineCount; // 最後の行まであと15行程度なのであれば、最後の行にいる扱いにする。
            }
            */
            var perY = posY / allLineCount;
            if (perY >= 1) {
                perY = 1.1; // これ丁度だと最後の行が微妙な感じになりやすい。
            }
            else if (perY < 0) {
                perY = 0;
            }
            // console.log("perY:"+perY);
            try {
                // hidemaru.postExecMacroMemory(`jsmode @"WebView2\HmBrowserAutoUpdaterMain"; js {setbrowserpaneurl("javascript:window.scrollTo(0, parseInt(${perY}*(document.documentElement.scrollHeight - document.documentElement.clientHeight)));", 2)}`);
                var js = "javascript:boxScroll(".concat(posY, ")");
                var command = "setbrowserpaneurl R\"SETBROWSERPANEURL1(".concat(js, ")SETBROWSERPANEURL1\", 2;");
                hidemaru.postExecMacroMemory(command);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}
var lastPosY = 0;
var lastPosYArray = [3, 2, 1]; // 全部違う値で先頭付近でとりあえず埋めておく
var lastAllLineCount = 0;
function getChangeYPos() {
    var diff = false;
    var posY = getCurCursorYPos();
    // console.log("posY:" + posY);
    var allLineCount = getAllLineCount();
    if (lastPosY != posY) {
        lastPosY = posY;
        diff = true;
    }
    lastPosYArray.push(posY);
    lastPosYArray.shift();
    // console.log(lastPosYArray);
    // ３つとも一緒(カーソルが動いていない) で マウスによる位置とかけ離れている時は、マウスによる位置を採用
    if (lastPosYArray[0] == lastPosYArray[1] && lastPosYArray[0] == lastPosYArray[2]) {
        var mousePosY = getCurCursorYPosFromMousePos();
        if (mousePosY > 1) {
            // console.log("カーソル動いていない");
            // console.log("posY:" + posY + "\r\n");
            // console.log("mousePosY:" + mousePosY + "\r\n");
            var abs = Math.abs(posY - mousePosY);
            if (abs >= 15) {
                // console.log("マウスの位置との差:"+ abs);
                posY = mousePosY;
                diff = true;
            }
        }
    }
    else {
        diff = true;
    }
    // console.log("poallLineCounts:" + allLineCount);
    if (lastAllLineCount != allLineCount) {
        lastAllLineCount = allLineCount;
        diff = true;
    }
    return [diff, posY, allLineCount];
}
var lastFileName = "";
function isFileNameChanged() {
    var diff = false;
    var curFileName = hidemaru.getFileFullPath();
    if (curFileName != lastFileName) {
        diff = true;
    }
    lastFileName = curFileName;
    return diff;
}
var lastFileModified = 0;
function isFileLastModifyUpdated() {
    var diff = false;
    var filepath = hidemaru.getFileFullPath();
    if (filepath == "") {
        return false;
    }
    var fso = hidemaru.createObject("Scripting.FileSystemObject");
    var f = fso.GetFile(filepath);
    var m = f.DateLastModified;
    if (m != lastFileModified) {
        diff = true;
        lastFileModified = m;
    }
    return diff;
}
var updateCount = 0;
function isCountUpdated() {
    var curCount = hidemaru.getUpdateCount();
    if (updateCount != curCount) {
        updateCount = curCount;
        return true;
    }
    return false;
}
var preText = "";
function isTextUpdated() {
    var curText = hidemaru.getTotalText();
    if (curText != undefined && preText != curText) {
        preText = curText;
        return true;
    }
    return false;
}
function initVariable() {
    lastPosYArray = [3, 2, 1];
}
function stopIntervalTick() {
    if (timerHandle != 0) {
        clearInterval(timerHandle);
    }
}
function createIntervalTick(func) {
    initVariable();
    stopIntervalTick();
    timerHandle = setInterval(func, 1000);
    return timerHandle;
}
function getAllLineCount() {
    var text = hidemaru.getTotalText();
    var cnt = text.match(/\n/g);
    if (cnt) {
        return cnt.length;
    }
    else {
        return 1;
    }
}
function getCurCursorYPos() {
    var pos = hidemaru.getCursorPos("wcs");
    return pos[0];
}
function getCurCursorYPosFromMousePos() {
    var pos = hidemaru.getCursorPosFromMousePos("wcs");
    return pos[0];
}
updateMethod();
createIntervalTick(updateMethod);
