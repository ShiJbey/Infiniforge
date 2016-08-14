bl_info = {
    "name" : "Sword Generator",
    "author" : "Shi Johnson-Bey",
    "version" : ( 1, 0, 0 ),
    "blender" : ( 2, 77, 0 ),
    "location" : "View3D > Add > Mesh",
    "description" : "Procedurally generates swords for an MMO game from a random seed",
    "wiki_url" : "",
    "tracker_url" : "",
    "category" : "Add Mesh"
}

if "bpy" in locals():
    import importlib
    importlib.reload( sword_forger )
else:
    from . import sword_forger

import bpy
from bpy.props import StringProperty, BoolProperty, IntProperty
from bpy.types import Operator

""""Procedurally generates a sword mesh  based on input items and a random seed.""""
class ForgeSword( Operator ):
    bl_idname = "mesh.forge_sword"
    bl_label = "Sword"
    bl_options = { 'REGISTER', 'UNDO' }

    # Seed for proc gen
    random_seed = IntProperty( default = 3, min = 0, name = 'Seed' )
    # Proc gen inputs ( based off of items given )


    def execute( self, context ):
        # Call to generation function
        sword_forger.forge_sword()
        return { 'FINISHED' }

def menu_func( self, context ):
    self.layout.operator( ForgeSword.bl_idname, text="Sword" )

def register():
    bpy.utils.register_module( __name__ )
    bpy.types.INFO_MT_mesh.add.remove( menu_func )

if __name__ == "__main__":
    register()