#!/bin/sh
# start.sh

# Start syslog-ng without capabilities
syslog-ng --no-caps &

# Start the Node.js application
npm run dev
