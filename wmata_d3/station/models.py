import wmata_d3
from sqlalchemy import Column, String
from geoalchemy2.types import Geography
from geoalchemy2.shape import to_shape


class Station(wmata_d3.Base):
    """A metro station"""

    __tablename__ = 'stations'

    code = Column(String(8), primary_key=True)
    name = Column(String(64))
    station_together_1 = Column(String(8))
    point = Column(Geography(geometry_type='POINT', srid=4326))

    @property
    def dto(self):
        return {
            'code': self.code,
            'name': self.name,
            'stationTogether1': self.station_together_1,
            'lat': to_shape(self.point).x,
            'long': to_shape(self.point).y
        }
