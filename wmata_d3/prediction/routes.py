import http.client, json
from flask_restful import Resource
from wmata_d3 import app


class Prediction(Resource):
    def get(self):
        headers = {'api_key': app.config['WMATA_API_KEY']}

        try:
            conn = http.client.HTTPSConnection(app.config['WMATA_API_URL'])
            conn.request('GET', '/StationPrediction.svc/json/GetPrediction/All', '{body}', headers)
            data = conn.getresponse().read()
            conn.close()
            return json.loads(data.decode('utf-8'))
        except Exception as e:
            print('[Errno {0}] {1}'.format(e.errno, e.strerror))