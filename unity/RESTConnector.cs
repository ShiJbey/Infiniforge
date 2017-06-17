using System;
using System.Net;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class RESTConnector : MonoBehaviour {

    // API route information
    public string restAddr = "127.0.0.1";
    public string restPort = "8080";
    public string extensionRoute = "forge/";
    public string[] routeParams;

    private static string baseRoute = "/api/";

    // Object to hold imported JSON information
    private WeaponMesh wMesh;

    // Verts and tris for generating the mesh
    private List<Vector3> vertices;
    private List<int> triangles;

    
    // Serial Object for importing the weapon mesh information from JSON
    [Serializable]
    class WeaponMesh
    {
        public float[] vertices = null;     // Individual Coordinates aggregated into single array [x,y,z,...,x,y,z]
        public int[] faces = null;          // Specifies how the vertices whould be organized into triangles
        public int[][] uvs = null;            // Stores Uv information
        public string weapon_type = null;   // Type of weapon represented by this mesh
        public string weapon_style = null;  // Style of the weapon type represented by this mesh
        public float scale = 1f;    // Scale of the mesh given
    }

    int GetNumUVLayers()
    {
        int nUvLayers = 0;

        if (wMesh != null)
        {
            for (int i = 0; i < wMesh.uvs.Length; i++)
            {
                if (wMesh.uvs[i].Length != 0)
                    nUvLayers++;
            }
        }

        return nUvLayers;
    }

    

    // If wMesh is not null then we generate a new mesh for this object
    public void GenerateMesh()
    {
        // Instantiate Vert and Tri Lists
        vertices = new List<Vector3>();
        triangles = new List<int>();

        if (wMesh == null)
            return;
        // We need to traverse the coordinates in the wMesh vertices array
        AssignVertices();
        // Traverse the faces array to generate the necessary tris
        AssignTriangles();

        // Creates and sets the new mesh
        Mesh mesh = new Mesh();
        mesh.name = wMesh.weapon_style + " " + wMesh.weapon_type;
        GetComponent<MeshFilter>().mesh = mesh;
        mesh.vertices = vertices.ToArray();
        mesh.triangles = triangles.ToArray();
        mesh.RecalculateNormals();
    }

    // Checks if a bit at a given position within the binary 
    // representation of number is set to 1
    public bool isBitSet(int value, int position)
    {
        int result = value & (1 << position);
        if (result != 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    void AssignVertices()
    {
        if (wMesh == null)
        {
            return;
        }

        if (wMesh.vertices.Length < 3 || wMesh.vertices.Length % 3 != 0)
        {
            return;
        }

        float scale = wMesh.scale;
        
        for (int i = 0; i < wMesh.vertices.Length; i+=3)
        {
            vertices.Add (new Vector3(wMesh.vertices[i] * scale, wMesh.vertices[i + 1] * scale, wMesh.vertices[i + 2] * scale));
        }
    }


    // Uses the faces array in wMesh to set the triangles
    void AssignTriangles()
    {
        int offset = 0;
        int zLength = wMesh.faces.Length;
        
        int[] faces = wMesh.faces;

        while (offset < zLength)
        {
            int type = faces[offset++];

            bool isQuad = isBitSet(type, 0);
            bool hasMaterial = isBitSet(type, 1);
            bool hasFaceVertexUv = isBitSet(type, 3);
            bool hasFaceNormal = isBitSet(type, 4);
            bool hasFaceVertexNormal = isBitSet(type, 5);
            bool hasFaceColor  = isBitSet(type, 6);
            bool hasFaceVertexColor = isBitSet(type, 7);

            if (isQuad)
            {
                // Creates the two triangles to represent the quad
                CreateTriangle(faces[offset], faces[offset + 1], faces[offset + 3]);
                CreateTriangle(faces[offset + 1], faces[offset + 2], faces[offset + 3]);
                // Moves the offset forward since the 4 verts have been accounted for
                offset += 4;

                if (hasMaterial)
                {
                    offset++;
                }
                    
               
                if (hasFaceVertexUv)
                {
                    int nUvLayers = GetNumUVLayers();
                    for (int i = 0; i < nUvLayers; i++)
                    {
                        for (int j = 0; j < 4; j++)
                        {
                            offset++;
                        }
                    }
                    
                }
                    
                if (hasFaceNormal)
                {
                    offset++;
                }

                if (hasFaceVertexNormal)
                {
                    for (int i = 0; i < 4; i++)
                    {
                        offset++;
                    }
                }

                if (hasFaceColor)
                {
                    offset++;
                }

                if (hasFaceVertexColor)
                {
                    for (int i = 0; i < 4; i++)
                    {
                        offset++;
                    }
                }
                    
            }
            else
            {
                // Creates a single tri
                CreateTriangle(faces[offset], faces[offset + 1], faces[offset + 2]);
                // Moves offset forward to account for the added verts
                offset += 3;

                if (hasMaterial)
                {
                    offset++;
                }

                if (hasFaceVertexUv)
                {
                    int nUvLayers = GetNumUVLayers();
                    for (int i = 0; i < nUvLayers; i++)
                    {
                        for (int j = 0; j < 3; j++)
                        {
                            offset++;
                        }
                    }

                }

                if (hasFaceNormal)
                {
                    offset++;
                }

                if (hasFaceVertexNormal)
                {
                    for (int i = 0; i < 3; i++)
                    {
                        offset++;
                    }
                }

                if (hasFaceColor)
                {
                    offset++;
                }

                if (hasFaceVertexColor)
                {
                    for (int i = 0; i < 3; i++)
                    {
                        offset++;
                    }
                }
            }

        }

    }


    void CreateTriangle(int a, int b, int c)
    {
        triangles.Add(a);
        triangles.Add(b);
        triangles.Add(c);
    }

    void Start()
    {

    }

    void Update()
    {
        if(Input.GetMouseButtonDown(0))
        {
            StartCoroutine(GetJsonData());
        }
    }

    IEnumerator GetJsonData()
    {
        UnityWebRequest www = UnityWebRequest.Get(GetRequestUrl());
        yield return www.Send();

        if (www.isError)
        {
            Debug.Log (www.error);
        }
        else
        {
            //Debug.Log(www.downloadHandler.text);
            wMesh = JsonUtility.FromJson<WeaponMesh> (www.downloadHandler.text);
            GenerateMesh();
        }
    }

    // Returns the Url to be used when making the http request
    string GetRequestUrl()
    {
        string requestUrl = "http://" + restAddr + ":" + restPort + baseRoute + extensionRoute;
        for (int i = 0; i < routeParams.Length; i++)
        {
            requestUrl = requestUrl + routeParams[i] + "/";
        }
        return requestUrl;
    }
}
