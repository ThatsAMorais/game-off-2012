#pragma strict

var camHeight : int = 15;
var camPos : Vector3 = Vector3(32,camHeight,32);
var posMax : int = 10;
var posMin : int = -10;
var htMax : int = 12;
var htMin : int = 4;
var camOrigin : Transform;

public var currentSelection : Transform; // hold Fire1-selected
private var originalColorOfSelected : Color;
public var targetedSelection : Transform; // hold Fire2-selected
private var originalColorOfTargeted : Color;

function Start () {
	gameObject.Find("Main Camera").transform.position = camOrigin.transform.position;
	gameObject.Find("Main Camera").transform.position.y = camHeight;
}

function Update () {

	camPos = gameObject.Find("Main Camera").transform.position;
	if(Input.GetKey(KeyCode.LeftControl))
	{
		if(Input.GetButtonDown("Fire1"))
		{
			var ray = Camera.main.ScreenPointToRay(Input.mousePosition);
			var hit : RaycastHit;
			var layerMask : LayerMask = -1;
			
			layerMask = 1 << LayerMask.NameToLayer("Forkers") |
						1 << LayerMask.NameToLayer("Branchers") |
						1 << LayerMask.NameToLayer("Buildings");
			 
			// Check if we hit a selectable object like a unit or building
			if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
			{
				if(null != currentSelection)
				{
					currentSelection.renderer.material.color = originalColorOfSelected;
				}
				
				currentSelection = hit.transform; // grab the object that we hit, so we can move it around
				originalColorOfSelected = currentSelection.renderer.material.color;
				currentSelection.renderer.material.color = Color.magenta;
			}
		}
		
		if((null != currentSelection) && (Input.GetButtonDown("Fire2")))
		{
			// Operate on targetedSelection accordingly
		}
	}	
	else
    {
    	gameObject.Find("Main Camera").transform.position = Vector3(Mathf.Clamp(camPos.x + Input.GetAxis("Mouse X"), posMin, posMax),
																	Mathf.Clamp(camPos.y + Input.GetAxis("Mouse ScrollWheel"), htMin, htMax),
																	Mathf.Clamp(camPos.z + Input.GetAxis("Mouse Y"), posMin, posMax));
		
		gameObject.Find("Point light").light.intensity = gameObject.Find("Main Camera").transform.position.y*0.2;
	}
}