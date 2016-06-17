from flask import Flask, render_template
from flask_restful import Api
from db import init_db


app = Flask(__name__)
app.config.from_object('config.Config')
app.config.from_envvar('AUTH_CONFIG')
db_engine, db_session, Base = init_db(app.config['SQLALCHEMY_DATABASE_URI'])


from wmata_d3.station.routes import Station
from wmata_d3.prediction.routes import Prediction
from wmata_d3.line.routes import Path


@app.route('/')
def home():
    return render_template('layout.html')


api = Api(app)
api.add_resource(Station, '/stations')
api.add_resource(Prediction, '/predictions')
api.add_resource(Path, '/paths')