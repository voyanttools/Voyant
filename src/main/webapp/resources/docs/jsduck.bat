:: generate docs (no spyral)
@REM ruby C:\Ruby31-x64\lib\ruby\gems\3.1.0\gems\jsduck-5.3.4\bin\jsduck --config resources\docs\en\config.json --output docs && copy docs\index.html docs\index.jsp

:: generate spyral source for api
python ..\spyral\src-jsduck\jsdocs.py --input-dir ..\spyral\node_modules\voyant\src ..\spyral\src --output-file ..\spyral\src-jsduck\spyral.js

:: generate docs (with spyral)
ruby C:\Ruby31-x64\lib\ruby\gems\3.1.0\gems\jsduck-5.3.4\bin\jsduck --no-source --verbose --warnings=-image_unused --config ..\docs\en\config.json --output ..\..\docs --ignore-global ..\spyral\src-jsduck\ && copy ..\..\docs\index.html ..\..\docs\index.jsp && copy mirrors.jsp ..\..\docs && copy servers.json ..\..\docs