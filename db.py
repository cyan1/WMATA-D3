from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base


def init_db(db_uri):
    engine = create_engine(db_uri, convert_unicode=True)
    db_session = scoped_session(sessionmaker(autocommit=False,
                                             autoflush=False,
                                             bind=engine))

    Base = declarative_base()
    Base.query = db_session.query_property()

    return engine, db_session, Base
