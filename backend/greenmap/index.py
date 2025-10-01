"""
Business: API для управления зелёными насаждениями - растениями и газонами
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name, function_version
Returns: HTTP response dict with statusCode, headers, body
"""

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
import psycopg2.extras

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    try:
        conn = psycopg2.connect(dsn)
        conn.autocommit = True
        cursor = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            resource_type = params.get('type', 'plants')
            
            if resource_type == 'plants':
                cursor.execute("""
                    SELECT id, type, species, age, crown_diameter, height, damages, 
                           health_status, position_lat, position_lng
                    FROM plants
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                plants = []
                for row in rows:
                    plants.append({
                        'id': row[0],
                        'type': row[1],
                        'species': row[2],
                        'age': row[3],
                        'crownDiameter': float(row[4]),
                        'height': float(row[5]),
                        'damages': row[6] or '',
                        'healthStatus': row[7],
                        'position': [float(row[8]), float(row[9])]
                    })
                
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'plants': plants})
                }
            
            if resource_type == 'lawns':
                cursor.execute("""
                    SELECT id, area, grass_type, health_status, positions
                    FROM lawns
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                lawns = []
                for row in rows:
                    lawns.append({
                        'id': row[0],
                        'area': float(row[1]),
                        'grassType': row[2],
                        'healthStatus': row[3],
                        'positions': row[4]
                    })
                
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'lawns': lawns})
                }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            resource_type = body_data.get('type')
            
            if resource_type == 'plant':
                plant = body_data.get('data')
                cursor.execute("""
                    INSERT INTO plants (id, type, species, age, crown_diameter, height, 
                                      damages, health_status, position_lat, position_lng)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    plant['id'], plant['type'], plant['species'], plant['age'],
                    plant['crownDiameter'], plant['height'], plant.get('damages', ''),
                    plant['healthStatus'], plant['position'][0], plant['position'][1]
                ))
                
                cursor.close()
                conn.close()
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': plant['id']})
                }
            
            if resource_type == 'lawn':
                lawn = body_data.get('data')
                cursor.execute("""
                    INSERT INTO lawns (id, area, grass_type, health_status, positions)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    lawn['id'], lawn['area'], lawn['grassType'], 
                    lawn['healthStatus'], json.dumps(lawn['positions'])
                ))
                
                cursor.close()
                conn.close()
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': lawn['id']})
                }
        
        if method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            obj_id = params.get('id')
            resource_type = params.get('type', 'plant')
            
            if not obj_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing id parameter'})
                }
            
            if resource_type == 'plant':
                cursor.execute("DELETE FROM plants WHERE id = %s", (obj_id,))
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            if resource_type == 'lawn':
                cursor.execute("DELETE FROM lawns WHERE id = %s", (obj_id,))
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }