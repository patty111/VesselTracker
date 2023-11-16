
python -m venv env
./env/Scripts/activate

pip install -r requirements.txt

deactivate


Set-Location ./server

npm install

Set-Location $PSScriptRoot