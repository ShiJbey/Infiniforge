# sword_forger.py
#
# Blender script for procedurally generating swords for a MMO crafting system
# 
# Created by: Shi Johnson-Bey ( shijbey@udel.edu )

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

DIR = os.path.dirname( os.path.abspath( __file__ ) )

def resource_path( *path_components ):
    return os.path.join( DIR, *path_components )

# Removes any sword objects from the scene
def resetScene() :
    for item in bpy.data.objects:
        item.select = item.name.startswith( 'Sword' )
    bpy.ops.object.delete()
# end resetScene

# Creates the blade cross-section to be extruded later for building the blade
def buildBladeCrossSection() :
	# Create a circle to generate the cross section of the blade
	bpy.ops.mesh.primitive_circle_add(vertices=8, radius=1, fill_type='NOTHING', calc_uvs=False, view_align=False, enter_editmode=False, location=(0, 0, 0), rotation=(0, 0, 0), layers=(True, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False))

	# Select verteces for shapping fuller edges
	# ...

	# Move vertices along x-axis to determine width of fuller
	bpy.ops.transform.translate(value=(0.4, 0, 0), constraint_axis=(True, False, False), constraint_orientation='GLOBAL', mirror=True, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1, snap=False, snap_target='CLOSEST', snap_point=(0, 0, 0), snap_align=False, snap_normal=(0, 0, 0), gpencil_strokes=False, texture_space=False, remove_on_cancel=False, release_confirm=False)

	# Move vertices along y-axis to produce fuller height
	bpy.ops.transform.translate(value=(0, -0.4, 0), constraint_axis=(False, True, False), constraint_orientation='GLOBAL', mirror=True, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1, snap=False, snap_target='CLOSEST', snap_point=(0, 0, 0), snap_align=False, snap_normal=(0, 0, 0), gpencil_strokes=False, texture_space=False, remove_on_cancel=False, release_confirm=False)
	
	# Select the remaining vertex to create top fuller trough
	# ...

	# Move the vertices along the y-axis to produce the fuller depth
	bpy.ops.transform.translate(value=(0, -0.8, 0), constraint_axis=(False, True, False), constraint_orientation='GLOBAL', mirror=True, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1, snap=False, snap_target='CLOSEST', snap_point=(0, 0, 0), snap_align=False, snap_normal=(0, 0, 0), gpencil_strokes=False, texture_space=False, remove_on_cancel=False, release_confirm=False)
# end buildBladeCrossSection

def buildBladeBody( isSymmetrical = True ) :
	# Extrude the blade veritcally
	bpy.ops.mesh.extrude_region_move(MESH_OT_extrude_region={"mirror":False}, TRANSFORM_OT_translate={"value":(0, 0, 0), "constraint_axis":(False, False, False), "constraint_orientation":'GLOBAL', "mirror":False, "proportional":'DISABLED', "proportional_edit_falloff":'SMOOTH', "proportional_size":1, "snap":False, "snap_target":'CLOSEST', "snap_point":(0, 0, 0), "snap_align":False, "snap_normal":(0, 0, 0), "gpencil_strokes":False, "texture_space":False, "remove_on_cancel":False, "release_confirm":False})

	# Scale the width of the blade to produce serrations
	bpy.ops.transform.resize(value=(1, 1, 1), constraint_axis=(False, False, False), constraint_orientation='GLOBAL', mirror=False, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1, snap=False, snap_target='CLOSEST', snap_point=(0, 0, 0), snap_align=False, snap_normal=(0, 0, 0), gpencil_strokes=False, texture_space=False, remove_on_cancel=False, release_confirm=False)
# end buildBlade

def buildBladeTip( isSymmetrical = True ) :
	# Extrudes verically for the tip length
	bpy.ops.mesh.extrude_region_move(MESH_OT_extrude_region={"mirror":False}, TRANSFORM_OT_translate={"value":(0, 0, 0), "constraint_axis":(False, False, False), "constraint_orientation":'GLOBAL', "mirror":False, "proportional":'DISABLED', "proportional_edit_falloff":'SMOOTH', "proportional_size":1, "snap":False, "snap_target":'CLOSEST', "snap_point":(0, 0, 0), "snap_align":False, "snap_normal":(0, 0, 0), "gpencil_strokes":False, "texture_space":False, "remove_on_cancel":False, "release_confirm":False})

	# Scales down to a point
	bpy.ops.transform.resize(value=(1, 1, 1), constraint_axis=(False, False, False), constraint_orientation='GLOBAL', mirror=False, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1, snap=False, snap_target='CLOSEST', snap_point=(0, 0, 0), snap_align=False, snap_normal=(0, 0, 0), gpencil_strokes=False, texture_space=False, remove_on_cancel=False, release_confirm=False)
# end buildTip

def buildBlade() :
	# Callsthe helper functions to create a mesh of the blade (not including the handle or guard)
	buildBladeCrossSection()
	buildBladeBody()
	buildBladeTip()
# end buildBlade

# constructs the guard of the blade from either a cube or a sphere
def buildGuard():
	# Begins with a cube
	bpy.ops.mesh.primitive_cube_add(radius=1, calc_uvs=False, view_align=False, enter_editmode=False, location=(0, 0, 0), rotation=(0, 0, 0), layers=(False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False, False))
	# Scale out to meet blade width
	bpy.ops.transform.resize(value=(1, 1, 1), constraint_axis=(False, False, False), constraint_orientation='GLOBAL', mirror=False, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1, snap=False, snap_target='CLOSEST', snap_point=(0, 0, 0), snap_align=False, snap_normal=(0, 0, 0), gpencil_strokes=False, texture_space=False, remove_on_cancel=False, release_confirm=False)
# end buildGuard

# Extrudes out the handle of the blade from the pommel
def extrudeHandle():
	# Takes in the object modified by build_pommel
	# does a series of extrude and scales to produce
	# a basic weapon handle

def buildHandle() :
	# Add a sphere to the scene

	# Remove necessary polies

	# Extrudes the handle directly from the pommel
	extrudeHandle()
# end buildHandle

# Aligns and groups the components made
def combineComponents():
	#joins the different objects
# end combineComponents


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
        