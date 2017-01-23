import sys
import bpy

# Get command line arguments
argv = sys.argv
argv = argv[ argv.index("--") + 1: ]

def deselectAll():
    for obj in bpy.data.objects:
        obj.select = False

def selectAll():
    for obj in bpy.data.objects:
        obj.select = True

def deleteAll():
    selectAll()
    bpy.ops.object.delete()


# Imports a mesh template of a sword
def importSwordTemplate( swordStyle="" ) :
    bpy.ops.import_mesh.stl(filepath=argv[0] + "/mesh-templates/" + argv[1] + "sword.stl" ,
                             axis_forward='Y',
                             axis_up='Z',
                             filter_glob="*.stl",
                             files=[],
                             directory="",
                             global_scale=1,
                             use_scene_unit=False,
                             use_facet_normal=False )

# Exports the mesh of the sword as a json file
def exportSwordJson( path="", swordStyle="" ) :
    filename = path + swordStyle + "sword.json";
    bpy.ops.export.three( filepath=filename,
                        option_apply_modifiers=False,
                        option_geometry_type='Geometry')
#    bpy.ops.export.three( filepath=argv[0] + "/json/" + argv[1] + "sword.json",
#                          check_existing=True,
#                          option_vertices=True,
#                          option_faces=True,
#                          option_normals=True,
#                          option_colors=False,
#                          option_mix_colors=False,
#                          option_uv_coords=True,
#                          option_materials=False,
#                          option_face_materials=False,
#                          option_maps=False,
#                          option_skinning=False,
#                          option_bones=False,
#                          option_extra_vgroups="",
#                          option_apply_modifiers=True,
#                          option_index_type='Uint16Array',
#                          option_scale=1,
#                          option_round_off=True,
#                          option_round_value=6,
#                          option_custom_properties=False,
#                          option_logging='disabled',
#                          option_geometry_type='geometry',
#                          option_export_scene=False,
#                          option_embed_animation=True,
#                          option_export_textures=True,
#                          option_embed_textures=False,
#                          option_texture_folder="",
#                          option_lights=False,
#                          option_cameras=False,
#                          option_hierarchy=False,
#                          option_animation_morph=False,
#                          option_blend_shape=False,
#                          option_animation_skeletal='off',
#                          option_keyframes=False,
#                          option_frame_index_as_time=False,
#                          option_frame_step=1,
#                          option_indent=True,
#                          option_compression='None',
#                          option_influences=2 )

# Creates a new sword and exports the mesh
def forgeSword( swordStyle = "long" ) :
    #recenterCursor()
    deleteAll()
    importSwordTemplate(swordStyle)
    #exportSwordJson()

forgeSword(argv[1])
