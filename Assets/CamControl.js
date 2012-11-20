#pragma strict

var camHeight : int = 15;
var camPos : Vector3 = Vector3(32,camHeight,32);
var posMax : int = 10;
var posMin : int = -10;
var htMax : int = 12;
var htMin : int = 4;
var camOrigin : GameObject;

public var currentSelection : GameObject; // hold Fire1-selected
private var originalColorOfSelected : Color;
public var targetedSelection : GameObject; // hold Fire2-selected
private var originalColorOfTargeted : Color;

function Start () {
	gameObject.Find("Main Camera").transform.position = camOrigin.transform.position;
	gameObject.Find("Main Camera").transform.position.y = camHeight;
}

function Update () {

	var camPos : Vector3 = gameObject.Find("Main Camera").transform.position;
	
	// Camera scrolling
	camPos.y = Mathf.Clamp(camPos.y + Input.GetAxis("Mouse ScrollWheel"), htMin, htMax);
	gameObject.Find("Point light").light.intensity = camPos.y*0.2;
	
	if(Input.GetKey(KeyCode.LeftShift))
	{
		/* Camera movement */
    	camPos.x = Mathf.Clamp(camPos.x + Input.GetAxis("Mouse X"), posMin, posMax);
    	camPos.z = Mathf.Clamp(camPos.z + Input.GetAxis("Mouse Y"), posMin, posMax);
	}
	else
	{
		/* Mouse Picking */
		var ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		var hit : RaycastHit;
		var layerMask : LayerMask = -1;
		
		if(Input.GetButtonDown("Fire1"))
		{			
			Debug.Log("Fire1 pressed");
			layerMask = 1 << LayerMask.NameToLayer("Forkers") |
						1 << LayerMask.NameToLayer("Branchers") |
						1 << LayerMask.NameToLayer("Buildings");
			  
			// Check if we hit a selectable object like a unit or building
			if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
			{
				SelectObject(GameObject.Find(hit.transform.name));
			}
		}
		
		if((null != currentSelection) && (Input.GetButtonUp("Fire2")))
		{
			Debug.Log("Fire2 pressed");
			layerMask = 1 << LayerMask.NameToLayer("Selectable") | 
						1 << LayerMask.NameToLayer("Trees") | 
						1 << LayerMask.NameToLayer("Buildings");
						
			// Operate on targetedSelection accordingly
			if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
			{
				TargetObject(GameObject.Find(hit.transform.name));
			}
		}
	}
	
	gameObject.Find("Main Camera").transform.position = camPos;
}

function ClearCurrentSelection()
{
	if(null != currentSelection)
	{
		currentSelection.renderer.material.color = originalColorOfSelected;
		
		//TODO: Use a selected mat 
	}
}

function ClearCurrentTargeted()
{
	if(null != targetedSelection)
	{
		targetedSelection.renderer.material.color = originalColorOfTargeted;
	}
}

function SelectObject(selected : GameObject)
{
	ClearCurrentSelection();
	ClearCurrentTargeted();
	
	currentSelection = selected;
	originalColorOfSelected = currentSelection.renderer.material.color;
	currentSelection.renderer.material.color = Color.magenta;
	
	// Update the UI to describe the object that was clicked
}

function TargetObject(targeted : GameObject)
{
	ClearCurrentTargeted();
	
	targetedSelection = targeted;
	originalColorOfTargeted = targetedSelection.renderer.material.color;
	targetedSelection.renderer.material.color = Color.green;
}

function BlinkTargeted()
{
	//TODO:
}