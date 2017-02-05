# This script is only responsible for generating sword meshes
# and was modeled from the AddBox template provided by Blender
import sys
import bpy
import bmesh
from random import random, seed, uniform, randint, randrange
import addon_utils

# Calculate the slope given the x and y coords of two points
def calculateSlope(x1, y1, x2, y2):
    slope = 0
    slope = (y2 - y1) / (x2 - x1)
    return slope

# Modify base egde div slopes
def modifyEdgeWidths(bladeEdgeVertsL, bladeEdgeVertsR, baseBladeWidth, minBladeWidth, maxBladeWidth):
    # Rules:
    # The X value of the verts needs to be within the tolerance ratio
    # with respect to bladeWidth/2
    # Example: If blade has width .6 and tolerance ratio is .1, then
    #          the x-values of the bladeEdgeVerts may not exceed
    #          .3 +/- .06

    divBladeWidth = baseBladeWidth
    for i in range(len(bladeEdgeVertsL)):
        #if i = 0:
        # Randomly choose a value for the 1st vertex
        #divBladeWidth = uniform(baseBladeWidth,maxBladeWidth)
        divBladeWidth = baseBladeWidth + (random() * (maxBladeWidth - minBladeWidth))
        # Set the x values for the verts s the width across is the div width
        bladeEdgeVertsL[i].co.x = -(divBladeWidth / 2)
        bladeEdgeVertsR[i].co.x = divBladeWidth / 2



# Exports the mesh of the sword as a json file
def exportSwordJson( path="", filen="", swordStyle="" ) :
    filePath = path + filen;
    bpy.ops.export.three(filepath=filePath,
                        option_apply_modifiers=False,
                        option_geometry_type='geometry')

# Clears the scene of all objects related to sword generation
def clearScene():
    for obj in bpy.data.objects:
        if obj.name.startswith("Sword"):
            obj.select = True
        elif obj.name.startswith("Handle"):
            obj.select = True
        elif obj.name.startswith("Guard"):
            obj.select = True
        elif obj.name.startswith("Pommel"):
            obj.select = True
        else:
            obj.select = False
    bpy.ops.object.delete()


# Returns the data for the sword object
def getBladeObj():
    for obj in bpy.data.objects:
        if obj.name.startswith("Sword"):
            return obj
    return None

# Returns data for the handle object
def getHandleObj():
    for obj in bpy.data.objects:
        if obj.name.startswith("Handle"):
            return obj
    return None

# Returns the data for the guard object
def getGuardObj():
    for obj in bpy.data.objects:
        if obj.name.startswith("Guard"):
            return obj
    return None

# Returns the data for the pommel object
def getPommelObj():
    for obj in bpy.data.objects:
        if obj.name.startswith("Pommel"):
            return obj
    return None

# Resets the 3D view cursor to the global origin
def resetBCursor():
    bpy.context.scene.cursor_location = (0.0, 0.0, 0.0)


# Extracts the BMVert objects from the array containing all
# objects related to BMesh geometry
def getVertsFromGeometry(bmGeometry):
    verts = []
    for i in range(len(bmGeometry)):
        if isinstance(bmGeometry[i], bmesh.types.BMVert):
            verts.append(bmGeometry[i])
    return verts

# Extracts the BMEdge objects from the array containing all
# objects related to BMesh geometry
def getEdgesFromGeometry(bmGeometry):
    edges = []
    for i in range(len(bmGeometry)):
        if isinstance(bmGeometry[i], bmesh.types.BMEdge):
            edges.append(bmGeometry[i])
    return edges

# Generates a bmesh which will become the pommel of the sword
# and moves it to the bottom of the handle
def generatePommel(bladeWidth=0.6,  HandleLength=1.35, pommelBladeWidthRatio=0.66):
    resetBCursor()
    pommelWidth = pommelBladeWidthRatio * bladeWidth
    bm = bmesh.new()
    sphereGeom = bmesh.ops.create_uvsphere(bm, u_segments=4, v_segments=4, diameter=(pommelWidth/2))
    sphereVerts = sphereGeom["verts"]
    bmesh.ops.translate(bm, vec=(0.0, 0.0, -HandleLength), verts=sphereVerts)
    return bm

# Generates the handel and moves it below the blade
def generateHandle(bladeWidth=0.6, bladeLength=7, handleLength=1.35, handleWidth=0.3):
    resetBCursor()
    bm = bmesh.new()
    allVerts = []
    crossSectionVerts = bmesh.ops.create_circle(bm, segments=8, diameter=(handleWidth/2), cap_ends=True)
    crossSectionVerts = crossSectionVerts["verts"]
    crossSectionEdges = bm.edges
    # Keeps track of all the verteces in the cylinder
    for v in crossSectionVerts:
        allVerts.append(v)
    geom = bmesh.ops.extrude_edge_only(bm, edges=crossSectionEdges)
    # Extract the verts and edges from the geometry
    geom = geom["geom"]
    crossSectionVerts = getVertsFromGeometry(geom)
    crossSectionEdges = getEdgesFromGeometry(geom)
    # Keeps track of all the verteces in the cylinder
    for v in crossSectionVerts:
        allVerts.append(v)
    # Give the cylinder some height
    bmesh.ops.translate(bm, vec=(0.0, 0.0, handleLength), verts=crossSectionVerts)
    # Moves the handle down
    bmesh.ops.translate(bm, vec=(0.0, 0.0, -handleLength), verts=allVerts)
    #bmesh.ops.bridge_loops(bm,edges=crossSectionEdges)
    #bmesh.ops.holes_fill(bm, edges=crossSectionEdges, sides=1)
    prepedEdges = bmesh.ops.edgenet_prepare(bm, edges=crossSectionEdges)
    prepedEdges = prepedEdges["edges"]
    bmesh.ops.edgenet_fill(bm, edges=prepedEdges)
    return bm

def generateGuard(bladeWidth=0.3, guardThickness=1.0, guardBladeWidthRatio=4):
    resetBCursor()
    bm = bmesh.new()
    cubeVerts = bmesh.ops.create_cube(bm, size=bladeWidth)
    cubeVerts = cubeVerts["verts"]
    bmesh.ops.scale(bm, vec=(guardBladeWidthRatio + 2, guardThickness, 0.2), verts=cubeVerts)
    return bm
    
# This function is where all the magic happens
# Given the seed value and the limts for the template,
# it generates a template blade then applies modifications
# to the edges
def generateBlade(seedVal='',
                  numBaseDivsMax=3,
                  numMidDivsMax=3,
                  numTipDivsMax=2,
                  minDivHeight=0.2,
                  bladeWidthToleranceRatio=0.2,
                  bladeWidth=0.6,
                  bladeLength=7,
                  bladeThickness=0.03,
                  fullerWidthRatio=0.33,
                  applyBevel=True,
                  equalBaseDivs=False,
                  equalMidDivs=False,
                  equalTipDivs=True):

    resetBCursor()
    # Checks for the seed value and uses it
    # for gnerating random numbers later on
    if seedVal:
        seed(seedVal)

    # Creates a circle mesh to serve as the blade cross section
    bm = bmesh.new()
    # Save the verts returned by creating the circle
    crossSectionVerts = bmesh.ops.create_circle(bm, segments=8, diameter=bladeWidth)
    # Next, we extract the verts array
    crossSectionVerts = crossSectionVerts["verts"]
    crossSectionEdges = bm.edges

    # Now we need to save arrays that refer to the verts on
    # left and right edges. These will be appended to with
    # each round of extrusions in the Z direction
    leftBaseEdgeVerts = [crossSectionVerts[2]]
    rightBaseEdgeVerts = [crossSectionVerts[6]]
    leftMidEdgeVerts = []
    rightMidEdgeVerts = []
    leftTipEdgeVerts = []
    rightTipEdgeVerts = []

    # Now we are going to reposition the verts to give the circle
    # more of a blade cross section look
    # Lets start with moving the top vertex closer to the x-axis
    crossSectionVerts[0].co.y = bladeThickness / 2
    crossSectionVerts[0].co.x = 0
    # Now do the same with the bottom
    crossSectionVerts[4].co.y = -(bladeThickness / 2)
    crossSectionVerts[4].co.x = 0

    # Finally we should move the remaining (except L/R Egde) verteces
    # closer to the x-axis
    crossSectionVerts[1].co.y = bladeThickness / 2
    crossSectionVerts[1].co.x = -((bladeWidth * fullerWidthRatio) / 1)

    crossSectionVerts[3].co.y = -(bladeThickness / 2)
    crossSectionVerts[3].co.x = -((bladeWidth * fullerWidthRatio) / 1)

    crossSectionVerts[5].co.y = -(bladeThickness / 2)
    crossSectionVerts[5].co.x = ((bladeWidth * fullerWidthRatio) / 1)

    crossSectionVerts[7].co.y = bladeThickness / 2
    crossSectionVerts[7].co.x = ((bladeWidth * fullerWidthRatio) / 1)


    # If we are applying a bevel then we should move verteces 0 and 4 closer
    # to the x
    if applyBevel:
        crossSectionVerts[0].co.y = crossSectionVerts[0].co.y * .5
        crossSectionVerts[4].co.y = crossSectionVerts[0].co.y * .5
   

    # Now we determine the number of divisions for each section
    numBaseDivs = randint(1, numBaseDivsMax)
    numMidDivs = randint(1, numMidDivsMax)
    numTipDivs = randint(1, numTipDivsMax)

    # We need to determine how much of the blade length each
    # section recieves
    portionForBase = .25
    portionForMid = .65
    portionForTip = 1 - portionForBase - portionForMid

    # Now we need to determine the height of each section
    baseHeight = bladeLength * portionForBase
    midHeight = bladeLength * portionForMid
    tipHeight = bladeLength * portionForTip

    equalBaseDivHeight = baseHeight
    equalMidDivHeight = midHeight
    equalTopDivHeight = tipHeight
    
    # Now we calculate the height of equaldivs in each section
    # if we are using equal div heights. If not then we will
    # simply use the minimum div height for creating heights
    # on the fly
    if equalBaseDivs:
        equalBaseDivHeight = baseHeight / numBaseDivs
    if equalMidDivs:
        equalMidDivHeight = midHeight / numMidDivs
    if equalTipDivs:
        equalTipDivHeight = tipHeight / numTipDivs
    

    # Now we are ready to extrude the blade in the z direction
    # Extrude once for every division within the base
    spaceLeft = baseHeight
    for i in range(numBaseDivs):
        # If equal then we will extrude upwards by a fixed amount
        if equalBaseDivs:
            # Reduce the amount of space we have left
            spaceLeft = spaceLeft - equalBaseDivHeight
            # Extrude equalBasedivHeight in the Z direction
            geom = bmesh.ops.extrude_edge_only(bm, edges=crossSectionEdges)
            # Extract the verts and edges from the geometry
            geom = geom["geom"]
            crossSectionVerts = getVertsFromGeometry(geom)
            crossSectionEdges = getEdgesFromGeometry(geom)
            # Update the arrays containing edges
            leftBaseEdgeVerts.append(crossSectionVerts[2])
            rightBaseEdgeVerts.append(crossSectionVerts[6])
            
            # Now we take the new verts created and translate them in the z direction
            # by equalBaseDivHeight
            bmesh.ops.translate(bm, vec=(0.0, 0.0, equalBaseDivHeight), verts=crossSectionVerts)
        else:
            divHeight = minDivHeight
            #if this is the last div then we just use the remaining space
            if i == (numBaseDivs - 1):
                divHeight = spaceLeft
            else:
                # Choose a number between minDivHeight and the amount of space left
                maxDivHeight = spaceLeft - (minDivHeight * (numBaseDivs - i))
                divHeight = uniform(minDivHeight, maxDivHeight)

            spaceLeft = spaceLeft - divHeight
            #Extrude
            geom = bmesh.ops.extrude_edge_only(bm, edges=crossSectionEdges)
            geom = geom["geom"]
            crossSectionVerts = getVertsFromGeometry(geom)
            crossSectionEdges = getEdgesFromGeometry(geom)
            # Update the arrays containing edges
            leftBaseEdgeVerts.append(crossSectionVerts[2])
            rightBaseEdgeVerts.append(crossSectionVerts[6])
            # Now we take the new verts created and translate them in the z direction
            # by divHeight
            bmesh.ops.translate(bm, vec=(0.0, 0.0, divHeight), verts=crossSectionVerts)
        if i == numBaseDivs - 1:
            leftMidEdgeVerts.append(leftBaseEdgeVerts[-1])
            rightMidEdgeVerts.append(rightBaseEdgeVerts[-1])
            
    # Extrude once for every division within the mid
    spaceLeft = midHeight
    for i in range(numMidDivs):
        if equalMidDivs:
            spaceLeft = spaceLeft - equalMidDivHeight
            geom = bmesh.ops.extrude_edge_only(bm, edges=crossSectionEdges)
            geom = geom["geom"]
            crossSectionVerts = getVertsFromGeometry(geom)
            crossSectionEdges = getEdgesFromGeometry(geom)
            # Update the arrays containing edges
            leftMidEdgeVerts.append(crossSectionVerts[2])
            rightMidEdgeVerts.append(crossSectionVerts[6])
            
            bmesh.ops.translate(bm, vec=(0.0, 0.0, equalMidDivHeight), verts=crossSectionVerts)
        else:
            # Choose a number between minDivHeight and the amount of space left
            divHeight = minDivHeight
            #if this is the last div then we just use the remaining space
            if i == (numMidDivs - 1):
                divHeight = spaceLeft
            else:
                # Choose a number between minDivHeight and max
                maxDivHeight = spaceLeft - (minDivHeight * (numMidDivs - i))
                divHeight = uniform(minDivHeight, maxDivHeight)

            spaceLeft = spaceLeft - divHeight
            geom = bmesh.ops.extrude_edge_only(bm, edges=crossSectionEdges)
            geom = geom["geom"]
            crossSectionVerts = getVertsFromGeometry(geom)
            crossSectionEdges = getEdgesFromGeometry(geom)
            leftMidEdgeVerts.append(crossSectionVerts[2])
            rightMidEdgeVerts.append(crossSectionVerts[6])
            bmesh.ops.translate(bm, vec=(0.0, 0.0, divHeight), verts=crossSectionVerts)
        if i == numMidDivs - 1:
            leftTipEdgeVerts.append(leftMidEdgeVerts[-1])
            rightTipEdgeVerts.append(rightMidEdgeVerts[-1])

    # Extrude once for every division within the tip
    spaceLeft = tipHeight
    for i in range(numTipDivs):
        if equalTipDivs:
            spaceLeft = spaceLeft - equalTipDivHeight
            geom = bmesh.ops.extrude_edge_only(bm, edges=crossSectionEdges)
            geom = geom["geom"]
            crossSectionVerts = getVertsFromGeometry(geom)
            crossSectionEdges = getEdgesFromGeometry(geom)
            # Update the arrays containing edges
            leftTipEdgeVerts.append(crossSectionVerts[2])
            rightTipEdgeVerts.append(crossSectionVerts[6])
            
            bmesh.ops.translate(bm, vec=(0.0, 0.0, equalTipDivHeight), verts=crossSectionVerts)
        else:
            # Choose a number between minDivHeight and the amount of space left
            divHeight = minDivHeight
            #if this is the last div then we just use the remaining space
            if i == (numTipDivs - 1):
                divHeight = spaceLeft
            else:
                # Choose a number between minDivHeight and max
                maxDivHeight = spaceLeft - (minDivHeight * (numTipDivs - i))
                divHeight = uniform(minDivHeight, maxDivHeight)

            spaceLeft = spaceLeft - divHeight
            geom = bmesh.ops.extrude_edge_only(bm, edges=crossSectionEdges)
            geom = geom["geom"]
            crossSectionVerts = getVertsFromGeometry(geom)
            crossSectionEdges = getEdgesFromGeometry(geom)
            # Update the arrays containing edges
            leftTipEdgeVerts.append(crossSectionVerts[2])
            rightTipEdgeVerts.append(crossSectionVerts[6])
            bmesh.ops.translate(bm, vec=(0.0, 0.0, divHeight), verts=crossSectionVerts)
        
        # This should create the tip of the blade
        if i == (numTipDivs - 1):
            for v in crossSectionVerts:
                v.co.x = 0
                v.co.y = 0
    
    # Now we apply Modifications to the edges
    minBladeWidth = bladeWidth - (bladeWidth * bladeWidthToleranceRatio)
    maxBladeWidth = bladeWidth + (bladeWidth * bladeWidthToleranceRatio) + 1
    
    print(leftBaseEdgeVerts)
    
    modifyEdgeWidths(leftBaseEdgeVerts, rightBaseEdgeVerts, bladeWidth, minBladeWidth, maxBladeWidth)
    modifyEdgeWidths(leftMidEdgeVerts, rightMidEdgeVerts, bladeWidth, minBladeWidth, maxBladeWidth)
    
    
    

    return bm




from bpy.props import (
    BoolProperty,
    BoolVectorProperty,
    FloatProperty,
    FloatVectorProperty,
    IntProperty,
    StringProperty
    )

class AddSword(bpy.types.Operator):
    """Create a sword mesh"""
    bl_idname = "mesh.sword_add"
    bl_label = "Add Sword"
    bl_options = {'REGISTER', 'UNDO'}

    seedVal = StringProperty(
        name="Seed",
        default="",
        description="Seed value for generation"
    )

    length = FloatProperty(
        name="Max Length",
        description="Maximum length the blade may be",
        min=2.0, max=10,
        default=7,
        )
    
    width = FloatProperty(
        name="Max Width",
        description="Maximum allowed width of the blade",
        min=0.01,max=0.5,
        default=0.3,
        )
    
    widthMarginRatio = FloatProperty(
        name="Width Margin Ratio",
        description="Determines the tolorance for changes in width allong the blade",
        min=0.01,max=0.5,
        default=0.3,
        )

    nBaseDivs = IntProperty(
            name="Base Divisions",
            description="The number of extrusions for the base of the blade",
            min=1, max=5,
            default = 2, 
        )
    
    nMidDivs = IntProperty(
            name="Mid Divisions",
            description="The number of extrusions for the middle of the blade",
            min=1, max=5,
            default = 2,
        )
    
    nTipDivs = IntProperty(
            name="Tip Divisions",
            description="The number of extrusions for the tip of the blade",
            min=1, max=5,
            default = 2,
        )
    
    scaleSword = BoolProperty(
        name="Scale Sword?",
        description="Do we scale thw sword or not",
        default=True,
    )
    scaleFactor = FloatProperty(
        name="Scale Factor",
        description="Scales the x,y,z coords of the sword by a factor",
        min=0.0, max=1.0,
        default=1.0,
    )

    layers = BoolVectorProperty(
            name="Layers",
            description="Object Layers",
            size=20,
            options={'HIDDEN', 'SKIP_SAVE'},
        )

    view_align = BoolProperty(
            name="Align to View",
            default=False,
            )
    
    location = FloatVectorProperty(
        name="Location",
        subtype='TRANSLATION',
        )
    
    rotation = FloatVectorProperty(
        name="Rotation",
        subtype='EULER',
    )

    def execute(self, context):
        clearScene()
        # Create a new data block to hold the sword
        mesh = bpy.data.meshes.new("Sword")
        # Create a new bmesh
        swordBM = generateBlade(
            seedVal=self.seedVal,
            bladeWidth=self.width,
            bladeLength=self.length,
            bladeWidthToleranceRatio=self.widthMarginRatio
        )
        # Set the mesh to the bmesh
        swordBM.to_mesh(mesh)
        mesh.update()

        # Now we create a simple guard and handle for the blade
        guardMesh = bpy.data.meshes.new("Guard")
        handleMesh = bpy.data.meshes.new("Handle")
        # create bmeshes
        guardBM = generateGuard()
        handleBM = generateHandle()
        # Set Meshes
        guardBM.to_mesh(guardMesh)
        guardMesh.update()
        handleBM.to_mesh(handleMesh)
        handleMesh.update()

        # Generate Pommel
        pommelMesh = bpy.data.meshes.new("Pommel")
        pommelBM = generatePommel()
        pommelBM.to_mesh(pommelMesh)
        pommelMesh.update()

        from bpy_extras import object_utils
        object_utils.object_data_add(context, mesh, operator=self)
        object_utils.object_data_add(context, guardMesh, operator=self)
        object_utils.object_data_add(context, handleMesh, operator=self)
        object_utils.object_data_add(context, pommelMesh, operator=self)

        # Probably should join the meshes here
        blade = getBladeObj()
        guard = getGuardObj()
        handle = getHandleObj()
        pommel = getPommelObj()

        blade.select = True
        guard.select = True
        handle.select = True
        pommel.select = True
        bpy.context.scene.objects.active = blade
        bpy.ops.object.join()

        # Optional scale
        if self.scaleSword:
            bpy.context.object.scale[0] = self.scaleFactor
            bpy.context.object.scale[1] = self.scaleFactor
            bpy.context.object.scale[2] = self.scaleFactor

        return {'FINISHED'}


def menu_func(self, context):
    self.layout.operator(AddSword.bl_idname, icon='MESH_CUBE')

def register():
    bpy.utils.register_class(AddSword)
    bpy.types.INFO_MT_mesh_add.append(menu_func)

def unregister():
    bpy.utils.unregister_class(AddSword)
    bpy.types.INFO_MT_mesh_add.remove(menu_func)

if __name__ == "__main__":
    addon_utils.enable("io_three")

    register()

    # Get command line arguments
    argv = sys.argv
    if len(argv) == 1:
        bpy.ops.mesh.sword_add()
    elif len(argv) >= 2:
        argv = argv[ argv.index("--") + 1: ]
        savePath = argv[0]
        fileName = argv[1]
        seedVal = argv[2]
        baseWidth = float(argv[3])
        widthMarginRatio = float(argv[4])
        length =  float(argv[5])
        # Create the sword
        bpy.ops.mesh.sword_add(seedVal=seedVal, width=baseWidth, widthMarginRatio=widthMarginRatio, scaleFactor=.25)
        # Export the sword
        exportSwordJson(path=savePath,filen=fileName)
    