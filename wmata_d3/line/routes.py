import http.client, urllib.request, urllib.parse, urllib.error, json

from flask import jsonify
from flask_restful import Resource
from wmata_d3 import app
from .models import Line as LineModel


class Path(Resource):
    def get(self):
        headers = {'api_key': app.config['WMATA_API_KEY']}

        try:
            paths = []
            for l in [l.dto for l in LineModel.query.all()]:
                params = urllib.parse.urlencode({
                    'FromStationCode': l['startStationCode'],
                    'ToStationCode': l['endStationCode']
                })

                conn = http.client.HTTPSConnection(app.config['WMATA_API_URL'])
                conn.request("GET", "/Rail.svc/json/jPath?%s" % params, "{body}", headers)
                response = conn.getresponse()
                path = json.loads(response.read().decode('utf-8'))

                path['DisplayName'] = l['displayName']
                path['LineCode'] = l['lineCode']
                path['ClientXScalar'] = l['clientXScalar']
                path['ClientYScalar'] = l['clientYScalar']
                path['LabelTextColor'] = l['labelTextColor']

                paths.append(path)

            conn.close()

            return jsonify({'paths': paths})
        except Exception as e:
            print("[Errno {0}] {1}".format(e.errno, e.strerror))