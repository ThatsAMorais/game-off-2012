#pragma strict

var camHeight : int = 12;
var camPos : Vector3 = Vector3(32,camHeight,32);
var posMax : int = 10;
var posMin : int = -10;
var htMax : int = 12;
var htMin : int = 4;
var camOrigin : GameObject;

public var currentSelection : Transform; // hold Fire1-selected
//private var originalColorOfSelected : Color;
public var targetedSelection : Transform; // hold Fire2-selected
//private var originalColorOfTargeted : Color;
public var mouseoverTarget : Transform;

function Start ()
{
	gameObject.Find("Main Camera").transform.position = camOrigin.transform.position;
	gameObject.Find("Main Camera").transform.position.y = camHeight;
}

function Update ()
{
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
	
	DoMousePicking();
	
	gameObject.Find("Main Camera").transform.position = camPos;
}

function SetPosition(position : Vector3)
{
	var y : float = camPos.y;
	camPos = position;
	camPos.y = y;
	gameObject.transform.localPosition = camPos;
}

function GetSelectedGUIRect()
{
	return Rect(Screen.width*0.65, Screen.height*0.7, Screen.width*0.35, Screen.height*0.3);
}

function OnGUI()
{
	if(null != currentSelection)
	{
		if(currentSelection.name.Contains("base"))
		{
			currentSelection.GetComponent(BaseScript).DoSelectedGUI(GetSelectedGUIRect());
		}
		else if((currentSelection.name.Contains("forker")) ||
				(currentSelection.name.Contains("brancher")))
		{
			currentSelection.GetComponent(UnitScript).DoSelectedGUI(GetSelectedGUIRect());
		}
		else
		{
			Debug.Log("No patterns matched for currentSelected in OnGUI.");
		}
	}
}

function Mouseover(mouseover : Transform)
{
	ClearCurrentMouseover();
	mouseoverTarget = mouseover;
	mouseoverTarget.GetComponent(CellScript).MousedOver();
}

function DoMousePicking()
{
	/* Mouse Picking */
	var ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	var hit : RaycastHit;
	var layerMask : LayerMask = -1;
	
	layerMask = 1 << LayerMask.NameToLayer("GridCells");
	
	if(Input.GetButtonDown("Fire1"))
	{
		//Debug.Log("Fire2 pressed");
		/*layerMask = 1 << LayerMask.NameToLayer("Forkers") |
					1 << LayerMask.NameToLayer("Branchers") |
					1 << LayerMask.NameToLayer("Buildings");*/

		// Check if we hit a selectable object like a unit or building
		if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
		{
			SelectObject(hit.transform);
		}
	}
	else if((null != currentSelection) && (Input.GetButtonUp("Fire2")))
	{
		//Debug.Log("Fire2 pressed");
		/*layerMask = 1 << LayerMask.NameToLayer("Selectable") | 
					1 << LayerMask.NameToLayer("Trees") | 
					1 << LayerMask.NameToLayer("Buildings");*/
					
		// Operate on targetedSelection accordingly
		if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
		{
			TargetObject(hit.transform);
		}
	}
	else
	{
		// Check if we hit a selectable object like a unit or building
		if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
		{
			Mouseover(hit.transform);
		}
	}
}

function ClearCurrentSelection()
{
	if(null != currentSelection)
	{
		//currentSelection.renderer.material.color = originalColorOfSelected;
		currentSelection.GetComponent(CellScript).Selected(false);
		currentSelection = null;
	}
}


function ClearCurrentTargeted()
{
	if(null != targetedSelection)
	{
		//targetedSelection.renderer.material.color = originalColorOfTargeted;
		targetedSelection.GetComponent(CellScript).Targeted(true);
		targetedSelection = null;
	}
}


function ClearCurrentMouseover()
{
	if(null != mouseoverTarget)
	{
		mouseoverTarget.GetComponent(CellScript).MouseExited();
		mouseoverTarget = null;
	}
}

function SelectObject(selected : Transform)
{
	ClearCurrentSelection();
	//ClearCurrentTargeted();
	
	currentSelection = selected;
	//originalColorOfSelected = currentSelection.renderer.material.color;
	//currentSelection.renderer.material.color = Color.magenta;
	
	currentSelection.GetComponent(CellScript).Selected(true);
}

function TargetObject(targeted : Transform)
{
	ClearCurrentTargeted();
	
	targetedSelection = targeted;
	//originalColorOfTargeted = targetedSelection.renderer.material.color;
	//targetedSelection.renderer.material.color = Color.green;

	var targetPos : Vector2 = targetedSelection.GetComponent(CellScript).GetPosition();
	currentSelection.GetComponent(CellScript).Target(targetPos.x, targetPos.y);

}
