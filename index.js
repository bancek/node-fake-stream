'use strict';

var os = require('os'),
    fs = require('fs'),
    path = require('path');

var fakeStream = function (content, name, closeAfter, closeAfterCb) {
    var tmpPath, stream, bytesRead, cbCalled, oldRead;

    if (!name) {
        name = Math.floor(Math.random() * 10000000).toString();
    }

    tmpPath = path.join(os.tmpDir(), name);

    if (typeof content === 'number') {
        content = new Buffer(content);
    }

    fs.writeFileSync(tmpPath, content);

    stream = fs.createReadStream(tmpPath);

    if (closeAfter !== null) {
        bytesRead = 0;
        cbCalled = false;
        oldRead = stream.read;

        stream.read = function (size) {
            var data = oldRead.call(stream, size);

            if (data !== null) {
                bytesRead += data.length;

                if (bytesRead > closeAfter) {
                    if (!cbCalled) {
                        stream.close();

                        closeAfterCb();

                        cbCalled = true;
                    }
                }
            }

            return data;
        };
    }

    stream.on('close', function () {
        fs.unlink(tmpPath);
    });

    return stream;
};

module.exports = fakeStream;
