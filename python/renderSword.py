import sys
import bpy

argv = sys.argv
argv = argv[ argv.index("--") + 1: ]

# import template
bpy.ops.import_mesh.stl( filepath=argv[0] + "\\..\\mesh\\" + argv[1] + "sword.stl" , axis_forward='Y', axis_up='Z', filter_glob="*.stl", files=[], directory="", global_scale=1, use_scene_unit=False, use_facet_normal=False)

# export mesh
bpy.ops.export.three( filepath=argv[0] + "\\..\\json\\sword.json", check_existing=True, option_vertices=True, option_faces=True, option_normals=True, option_colors=False, option_mix_colors=False, option_uv_coords=True, option_materials=False, option_face_materials=False, option_maps=False, option_skinning=False, option_bones=False, option_extra_vgroups="", option_apply_modifiers=True, option_index_type='Uint16Array', option_scale=1, option_round_off=True, option_round_value=6, option_custom_properties=False, option_logging='disabled', option_geometry_type='geometry', option_export_scene=False, option_embed_animation=True, option_export_textures=True, option_embed_textures=False, option_texture_folder="", option_lights=False, option_cameras=False, option_hierarchy=False, option_animation_morph=False, option_blend_shape=False, option_animation_skeletal='off', option_keyframes=False, option_frame_index_as_time=False, option_frame_step=1, option_indent=True, option_compression='None', option_influences=2)