#!/usr/bin/env bash
export NODE_ENV=test
./node_modules/karma/bin/karma start test/karma/karma.edge.conf.js
./node_modules/karma/bin/karma start test/karma/karma.ie10.conf.js
./node_modules/karma/bin/karma start test/karma/karma.ie11.conf.js
./node_modules/karma/bin/karma start test/karma/karma.iphone5s.conf.js
./node_modules/karma/bin/karma start test/karma/karma.iphone6.conf.js
./node_modules/karma/bin/karma start test/karma/karma.iphone6plus.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.android4.1.conf.js
./node_modules/karma/bin/karma start test/karma/karma.android4.2.conf.js
./node_modules/karma/bin/karma start test/karma/karma.android4.3.conf.js
./node_modules/karma/bin/karma start test/karma/karma.android4.4.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.android5.1.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.chrome43.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.chrome44.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.chrome45.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.chrome46.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.chrome47.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.chrome48.conf.js
./node_modules/karma/bin/karma start test/karma/karma.chrome49.conf.js
./node_modules/karma/bin/karma start test/karma/karma.chrome50.conf.js
./node_modules/karma/bin/karma start test/karma/karma.chrome50osx.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.firefox44.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.firefox45.conf.js
./node_modules/karma/bin/karma start test/karma/karma.firefox46.conf.js
./node_modules/karma/bin/karma start test/karma/karma.firefox46osx.conf.js
./node_modules/karma/bin/karma start test/karma/karma.opera.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.safari6.conf.js
#./node_modules/karma/bin/karma start test/karma/karma.safari7.conf.js
./node_modules/karma/bin/karma start test/karma/karma.safari8.conf.js
./node_modules/karma/bin/karma start test/karma/karma.safari9.conf.js
./node_modules/.bin/lcov-result-merger './test/karma/coverage/**/lcov.info' 'lcov.info'
./node_modules/codeclimate-test-reporter/bin/codeclimate.js < lcov.info