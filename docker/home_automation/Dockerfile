FROM node:16-alpine3.16

COPY home-automation*.tgz /opt/home-automation/

RUN echo "net.ipv4.ip_forward=1" > /etc/systl.conf

WORKDIR /opt/home-automation

RUN npm install home-automation*.tgz

CMD ["/bin/sh", "-c", "node /opt/home-automation/node_modules/home-automation/dist/app.js | tee /opt/home-automation/home-automation.log" ]





