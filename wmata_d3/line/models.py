import wmata_d3
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import SMALLINT


class Line(wmata_d3.Base):
    """A metro line"""

    __tablename__ = 'lines'

    line_code = Column(String(8), primary_key=True)
    display_name = Column(String(16))
    start_station_code = Column(String(8))
    end_station_code = Column(String(8))
    internal_destination_1 = Column(String(8))
    internal_destination_2 = Column(String(8))
    client_x_scalar = Column(SMALLINT)
    client_y_scalar = Column(SMALLINT)
    label_text_color = Column(String(8))

    @property
    def dto(self):
        return {
            'lineCode': self.line_code,
            'displayName': self.display_name,
            'startStationCode': self.start_station_code,
            'endStationCode': self.end_station_code,
            'clientXScalar': self.client_x_scalar,
            'clientYScalar': self.client_y_scalar,
            'labelTextColor': self.label_text_color
        }
