var should = require('chai').should(),
    fs = require('fs'),
    fakeStream = require('..');

describe('FakeStream', function (){
    it('should create a stream with string', function (done){
        var stream = fakeStream('foobar');

        var content = '';

        stream.on('data', function (data){
            content += data;
        });

        stream.on('end', function (){
            content.should.equal('foobar');
            done();
        });
    });

    it('should create a stream with buffer', function (done){
        var stream = fakeStream(new Buffer('foobar'));

        var content = '';

        stream.on('data', function (data){
            content += data;
        });

        stream.on('end', function (){
            content.should.equal('foobar');
            done();
        });
    });

    it('should create a stream for size', function (done){
        var stream = fakeStream(2 << 20);

        var len = 0;

        stream.on('data', function (data){
            len += data.length;
        });

        stream.on('end', function (){
            len.should.equal(2 << 20);
            done();
        });
    });

    it('should create a stream with name', function (done) {
        var stream = fakeStream('foobar', 'file-name');

        /file-name$/.test(stream.path).should.be.true;

        stream.close();

        done();
    });

    it('should create a stream and close after some length', function (done) {
        var stream = fakeStream(2 << 20, null, 1 << 15, function () {
            setTimeout(function () {
                done();
            }, 10);
        });

        var len = 0;

        stream.on('data', function (data){
            len += data.length;
        });

        stream.on('end', function () {
            should.not.exist(true);
        });

        stream.on('close', function () {
            (len < (2 << 18)).should.be.true;
        });
    });

    it('should clean after itself', function (done) {
        var stream = fakeStream('foobar');

        fs.existsSync(stream.path).should.be.true;

        stream.on('data', function (data){});

        stream.on('end', function (){
            setTimeout(function (){
                fs.existsSync(stream.path).should.be.false;

                done();
            }, 10);
        });
    });
});
