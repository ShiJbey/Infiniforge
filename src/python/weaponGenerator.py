# weapon_generator.py
#
# This script uses procedural generation to produce
# a mesh for an MMO weapon given a set of inputs
# (developed on Blender 2.77)
#
# shijbey@shogunhustle.com

import sys
import os
import os.path
import bpy
import bmesh
import datetime
from math import sqrt, radians, pi, cos, sin
from mathutils import Vector, Matrix
from random import random, seed, uniform, randint, randrange
from enum import IntEnum
from colorsys import hls_to_rgb

DIR =  os.path.dirname( os.path.abspath( __file__ )

def resource_path( *path_components ):
	return os.path.join( DIR, *path_components )
	
# Deletes all existing weapons and unused materials from the scene
def reset_scene():
	for item in bpy.data.objects:
		item.select = item.name.startswith('Weapon')
	bpy.ops.object.delete()
	for material in bpy.data.materials:
		if not material.users:
			bpy.data.materials.remove( material )
	for texture in bpy.data.textures:
		if not texture.users:
			bpy.data.textures.remove( texture )

# Extrudes out the handle of the blade from the pommel
def handle_extrude( ):
	# Takes in the object modified by build_pommel
	# does a series of extrude and scales to produce
	# a basic weapon handle

# Builds Pommel
def build_pommel( startingShape, taper = .5 ):
	# takes a spere and either does nothing to it or extrudes it 
	# into a teardop shape ( need example pommels )

def build_blade( isSymmetrical ):
	# determine a blade cross section or use premade blade
	# Determine symmetry of the blade
	# modify:
	# -> Tip
	# -> Edge
	# -> Base

# constructs the guard of the blade from either a cube or a sphere
def build_guard( ):

# Aligns and groups the components made
def combine_components( ):


def generate_weapon( weaponType ):


if __name__ = "__main__":

	generate_single_weapon = True

	if generate_single_weapon:
		reset_scene
		customseed = ""
		obj = generate_weapon( customseed )

		for area in bpy.context.screen.area:
			if area.type == 'VIEW_3D':
				ctx = bpy.context.copy()
				
	else:
		
