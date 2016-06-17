WMATA D3 Visualization
======================

D3.js visualization of the WMATA metro map using real-time predictions from the WMATA API.

![alt tag](https://raw.githubusercontent.com/cyan1/WMATA-D3/544198f6941d997ff721fcb45058b7f9012362bf/WMATA_D3.png)

Environment
===========

Python Flask app with SQLAlchemy and PostgreSQL.

Setup
=====

Create a new Python 3.4.3 virtual environment under the top-level directory:

`virtualenv -p <path_to_python3.4.3> venv`

Activate it:

`. venv/bin/activate`

Run `pip install -r requirements.txt` to install Python dependencies.

Initialize the database:

`psql -d postgres -f init.sql`

Import app data:

`psql -d postgres -f import.sql`

Sign up as a [WMATA developer](https://developer.wmata.com/) to grab an API key. In the top-level project directory, create a config file named auth.cfg with a key named `WMATA_API_KEY` set to your API key.

Run
===

Export an environment variable named AUTH_CONFIG that is set to your auth.cfg file path.

With your virtual environment activated, run the server with `python run.py`.
