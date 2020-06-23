#!/bin/bash

echo "----------"
echo "Environment information"
echo "----------"
pacman -Q
echo "----------"
printenv
echo "----------"
echo "Running Tests"
echo "----------"
exit_code=0

[[ "$EXPECT_CLEAN_PATH" == true ]] || expect_clean_path=$?
[[ "$EXPECT_MSVC" == true ]] || expect_msvc=$?
[[ "$PATH" =~ "DUMMY_VALUE" ]] || path_dirty=$?
[[ "$PATH" =~ "Microsoft Visual Studio" ]] || has_msvc=$?

exit_code=0
if [[ $expect_clean_path != $path_dirty ]]; then
    echo "PASS: CLEAN_PATH=$EXPECT_CLEAN_PATH worked"
else
    echo "FAIL: CLEAN_PATH=$EXPECT_CLEAN_PATH failed"
    exit_code=1
fi

if [[ $expect_msvc == $has_msvc ]]; then
    echo "PASS: USE_MSVC=$EXPECT_MSVC worked"
else
    echo "FAIL: USE_MSVC=$EXPECT_MSVC did not work"
    exit_code=1
fi

echo "----------"

exit $exit_code
