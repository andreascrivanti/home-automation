#!/bin/sh

MOSQUITTO_PATH=/srv/services/mosquitto
HOME_AUTOMATION_PATH=/srv/services/home-automation
mkdir -p "$MOSQUITTO_PATH/config"
mkdir -p "$MOSQUITTO_PATH/log"
mkdir -p "$MOSQUITTO_PATH/data"
cp "package/docker/mosquitto/mosquitto.conf" "$MOSQUITTO_PATH/config/"
cp "package/docker/mosquitto/passwords" "$MOSQUITTO_PATH/config/"
cp "package/src/config/config.json" "$HOME_AUTOMATION_PATH/"

