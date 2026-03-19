#!/usr/bin/env python3
"""Wrapper script to run pip without /app in path"""
import sys
sys.path.remove('/app')
sys.path = [p for p in sys.path if p != '/app']
from pip._internal.cli.main import main
sys.exit(main())
