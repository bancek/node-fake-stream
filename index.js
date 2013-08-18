'use strict';

var os = require('os'),
    fs = require('fs'),
    path = require('path');

var fakeStream = function (content, name, closeAfter, closeAfterCb) {
    var tmpPath, stream, bytesRead, cbCalled, oldOn;

    if (!name) {
        name = Math.floor(Math.random() * 10000000).toString();
    }

    tmpPath = path.join(os.tmpDir(), name);

    if (typeof content === 'number') {
        content = new Buffer(content);
    }

    fs.writeFileSync(tmpPath, content);

    stream = fs.createReadStream(tmpPath);

    if (typeof closeAfter !== "undefined" && closeAfter !== null) {
        bytesRead = 0;
        cbCalled = false;
        oldOn = stream.on;

        stream.on = function (event, callback) {
            if (event === 'data') {
                oldOn.call(stream, event, function (data) {
                    bytesRead += data.length;

                    if (bytesRead > closeAfter) {
                        if (!cbCalled) {
                            stream.destroy();

                            closeAfterCb();

                            cbCalled = true;
                        }
                    }

                    callback(data);
                });
            }
        };
    }

    stream.on('close', function () {
        fs.unlink(tmpPath);
    });

    return stream;
};

module.exports = fakeStream;
