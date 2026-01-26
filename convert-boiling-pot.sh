#!/bin/bash

# Script to convert and crop BoilingPot.mov
# Adjust the CROP_WIDTH value to change how much is cropped from the sides
# CROP_WIDTH: percentage of original width to keep (0.3 = 30%, 0.4 = 40%, etc.)

CROP_WIDTH=0.4  # Change this value to adjust crop (0.3 = more crop, 0.5 = less crop)
CROP_X=$((echo "scale=2; (1 - $CROP_WIDTH) / 2") | bc)

cd "$(dirname "$0")/public"

ffmpeg -i BoilingPot.mov \
  -vf "crop=iw*${CROP_WIDTH}:ih:iw*${CROP_X}:0" \
  -c:v libx264 \
  -c:a aac \
  -preset medium \
  -crf 23 \
  BoilingPot.mp4 \
  -y

echo "Conversion complete! Crop width: ${CROP_WIDTH} (${CROP_X} offset from left)"
