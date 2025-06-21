@echo off
set IMAGE_NAME=dionidias/front-departamentalizacao
set VERSION=1.0

echo Building %IMAGE_NAME%:%VERSION%
docker build --no-cache -t %IMAGE_NAME%:%VERSION% .

echo Pushing %IMAGE_NAME%:%VERSION%
docker push %IMAGE_NAME%:%VERSION%

echo DONE!
pause
