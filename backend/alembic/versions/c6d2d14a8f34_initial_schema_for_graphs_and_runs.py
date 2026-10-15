"""Initial schema for graphs and runs

Revision ID: c6d2d14a8f34
Revises: 
Create Date: 2026-10-16 02:24:12.004258

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c6d2d14a8f34'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Universal JSON type
JsonType = sa.JSON().with_variant(JSONB, "postgresql")


def upgrade() -> None:
    op.create_table(
        'graphs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=True),
        sa.Column('nodes', JsonType, nullable=False),
        sa.Column('edges', JsonType, nullable=False),
        sa.Column('start_node', sa.String(length=50), nullable=False),
        sa.Column('goal_node', sa.String(length=50), nullable=False),
        sa.Column('metadata_json', JsonType, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.create_table(
        'runs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('graph_id', sa.String(length=36), sa.ForeignKey('graphs.id'), nullable=True),
        sa.Column('algorithm', sa.String(length=20), nullable=False),
        sa.Column('start_node', sa.String(length=50), nullable=False),
        sa.Column('goal_node', sa.String(length=50), nullable=False),
        sa.Column('found_goal', sa.Boolean(), nullable=False),
        sa.Column('path', JsonType, nullable=False),
        sa.Column('total_steps', sa.Integer(), nullable=False),
        sa.Column('nodes_expanded', sa.Integer(), nullable=False),
        sa.Column('terminal_status', sa.String(length=50), nullable=False),
        sa.Column('terminal_reason', sa.Text(), nullable=False),
        sa.Column('spec_version', sa.String(length=50), nullable=False),
        sa.Column('trace_version', sa.String(length=50), nullable=False),
        sa.Column('graph_snapshot', JsonType, nullable=False),
        sa.Column('events_json', JsonType, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('runs')
    op.drop_table('graphs')
