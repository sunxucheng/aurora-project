package aurora.ide.meta.gef.editors.parts;

import org.eclipse.draw2d.IFigure;
import org.eclipse.gef.EditPolicy;

import aurora.ide.meta.gef.editors.figures.GridFigure;
import aurora.ide.meta.gef.editors.models.Container;
import aurora.ide.meta.gef.editors.policies.BindGridPartEditPolicy;
import aurora.ide.meta.gef.editors.policies.FormLayoutEditPolicy;

public class GridPart extends ContainerPart {

	@Override
	protected IFigure createFigure() {
		GridFigure figure = new GridFigure();
		figure.setModel((Container) this.getComponent());
		return figure;
	}

	@Override
	protected void createEditPolicies() {
		super.createEditPolicies();
		installEditPolicy(EditPolicy.LAYOUT_ROLE, new FormLayoutEditPolicy());
		installEditPolicy("bm_drop", new BindGridPartEditPolicy());
		// ResizableEditPolicy rep = new ResizableEditPolicy();
		// rep.setResizeDirections(getResizeDirection());
		// installEditPolicy("RESIZE", rep);

	}

	protected void refreshVisuals() {
		super.refreshVisuals();
	}

	@Override
	public int getResizeDirection() {
		return NSEW;
	}
}
