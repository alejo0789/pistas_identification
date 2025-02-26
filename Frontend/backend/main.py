"""
Main application entry point
"""
import click
from app import create_app
from app.database import db, init_db

app = create_app()

@app.cli.command("init-db")
def initialize_database():
    """Command to initialize the database"""
    click.echo('Initializing the database...')
    init_db(app)
    click.echo('Database initialized!')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)