using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Steel : MonoBehaviour {

    public float roomTemp;     // In Degrees Fehrenheit
    public float temp;          // In Degrees Fehrenheit
    public float coolDownRate;  // Degrees Fahrenheit per second
    public float heatRate;  // Degrees Fahrenheit per second
    public int stageIndex;
    public bool inForge;

    private Color baseColor;
    private Material material;

    public static Color[] COLOR_STAGES = {
        new Color(255f/255f, 255f/255f, 255f/255f),    // White
        new Color(255f/255f, 255f/255f, 100f/255f),    // Yellow
        new Color(255f/255f, 100f/255f, 50f/255f),     // Orange
        new Color(255f/255f, 0f/255f, 0f/255f),        // Red
        new Color(100f/255f, 0f/255f, 0f/255f)         // Dark Red
    };

    public static float[] TEMP_STAGES = {
        2200f,  // White
        1830f,  // Yellow
        1450f,  // Orange
        1275f,  // Red
        930f    // Dark Red
    };

	// Use this for initialization
	void Start () {
        material = this.GetComponent<Renderer>().material;
        baseColor = material.color;
        stageIndex = -1;
	}
	
	// Update is called once per frame
	void Update () {
        //material.color = Color.Lerp(COLOR_STAGES[0], COLOR_STAGES[4], Mathf.PingPong(Time.time, 1));

        
        if (Input.GetKey(KeyCode.Space))
        {
            inForge = true;
            Heat(Time.deltaTime, 2200.0f);
            Debug.Log("Heating");
        }
        else if (!inForge)
        {
            Cool(Time.deltaTime);
        }
        else
        {
            inForge = false;
        }

        // Update the color
        UpdateColor();
        
    }

    public void Heat(float elapsed, float heatTemp)
    {
        if (temp < heatTemp)
        {
            float previousTemp = temp;
            temp += elapsed * heatTemp * heatRate;
            if (temp >= TEMP_STAGES[4] && previousTemp < TEMP_STAGES[4])
            {
                stageIndex = 0;
            }
        }
    }

    public void Cool(float elapsed)
    {
        if (temp > roomTemp)
        {
            temp -= coolDownRate * elapsed;
        }
        else
        {
            material.color = baseColor;
            stageIndex = -1;
        }
    }


    private static int GetCurrentStageIndex(float temp)
    {
        int closestIndex = 0;
        float closestDifference = float.MaxValue;
        for (int i = 0; i < Steel.TEMP_STAGES.Length; i++)
        {
            float difference = Mathf.Abs(Steel.TEMP_STAGES[i] - temp);
            if (difference < closestDifference)
            {
                closestIndex = i;
                closestDifference = difference;
            }
        }
        return closestIndex;
    }

    private void UpdateColor()
    {
        if (stageIndex == -1)
        {
            // The steel is completely cool
            if (inForge)
            {
                // The Steel is being heated
                float lerpFactor = Mathf.Abs(temp - Steel.TEMP_STAGES[4]) / Mathf.Abs(roomTemp - Steel.TEMP_STAGES[4]);
                material.color = Color.Lerp(baseColor, Steel.COLOR_STAGES[4], lerpFactor);
            }
            return;
        }


        // Determine which color is next based on if we are in the
        // forge (heating) or not
        int lastStageIndex = Steel.GetCurrentStageIndex(temp);
        int nextStageIndex = -1;
        
        if (lastStageIndex != stageIndex)
        {
            Debug.Log("Changing stage");
            stageIndex = lastStageIndex;
        }

        
        if (inForge)
        {
            // This is heating so the next index is lower
            if (lastStageIndex > 0)
            {
                nextStageIndex = lastStageIndex - 1;
            }
        }
        else
        {
            // This is cooling so the next index is lower
            if (lastStageIndex < Steel.COLOR_STAGES.Length - 1)
            {
                nextStageIndex = lastStageIndex + 1;
            }
            else
            {
                nextStageIndex = lastStageIndex;
            }
        }

        Color lastStageColor = Steel.COLOR_STAGES[lastStageIndex];
        Color nextStageColor = (nextStageIndex == -1) ? baseColor : Steel.COLOR_STAGES[nextStageIndex];
        float lastStageTemp = Steel.TEMP_STAGES[lastStageIndex];
        float nextStageTemp = (nextStageIndex == -1) ? roomTemp : Steel.TEMP_STAGES[nextStageIndex];

        float t = Mathf.Abs(temp - nextStageTemp) / Mathf.Abs(lastStageTemp - nextStageTemp);

        material.color = Color.Lerp(lastStageColor, nextStageColor, t);
    } 
}
