from flask import jsonify
from flask_restful import Resource
from .models import Station as StationModel


class Station(Resource):
    def get(self):
        results = [s.dto for s in StationModel.query.all()]
        top = right = bottom = left = results[0]

        for r in results:
            if r['lat'] > top['lat']:
                top = r
            elif r['lat'] < bottom['lat']:
                bottom = r
            elif r['long'] > right['long']:
                right = r
            elif r['long'] < left['long']:
                left = r

        return jsonify({
            'results': results,
            'xMin': left,
            'xMax': right,
            'yMin': top,
            'yMax': bottom
        })
