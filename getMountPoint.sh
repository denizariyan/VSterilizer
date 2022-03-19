#!/bin/bash
#Ref: https://unix.stackexchange.com/a/674365

devs=$( (
        for sysdevpath in $(find /sys/bus/usb/devices/usb*/ -name dev ); do
            # ( to launch a subshell here
            (
                syspath="${sysdevpath%/dev}"
                devname="$(udevadm info -q name -p $syspath)"
                [[ "$devname" == "bus/"* ]] && exit
                eval "$(udevadm info -q property --export -p $syspath)"
                [[ -z "$ID_SERIAL" ]] && exit
                echo "/dev/$devname - $ID_SERIAL"
            )& # & here is causing all of these queries to run simultaneously
        done
        wait
) | sort )

wait
if [ -z "$1" ]; then
    echo "${devs}"
else
    echo "${devs}" | grep "$1" | awk '{print $1}'
fi
exit 0