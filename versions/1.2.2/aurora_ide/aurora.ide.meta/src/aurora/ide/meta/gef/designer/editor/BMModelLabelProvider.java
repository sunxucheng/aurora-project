package aurora.ide.meta.gef.designer.editor;

import org.eclipse.jface.viewers.BaseLabelProvider;
import org.eclipse.jface.viewers.ILabelProvider;
import org.eclipse.jface.viewers.ITableColorProvider;
import org.eclipse.jface.viewers.ITableLabelProvider;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.Image;

import aurora.ide.meta.gef.designer.model.BMModel;
import aurora.ide.meta.gef.designer.model.Record;

public class BMModelLabelProvider extends BaseLabelProvider implements
		ITableLabelProvider, ITableColorProvider, ILabelProvider {
	private Color COLOR_ODD = new Color(null, 245, 255, 255);
	private Color COLOR_EVEN = new Color(null, 255, 255, 255);
	private int columnNumIndx = 1;
	private int type = BMModel.RECORD;

	public BMModelLabelProvider(int type) {
		super();
		this.type = type;
	}

	public Color getForeground(Object element, int columnIndex) {
		if (columnIndex == columnNumIndx)
			return new Color(null, 128, 128, 128);
		return null;
	}

	public Color getBackground(Object element, int columnIndex) {
		int rowNum = ((Record) element).getNum();
		return (rowNum % 2 == 0) ? COLOR_EVEN : COLOR_ODD;
	}

	public Image getColumnImage(Object element, int columnIndex) {
		return null;
	}

	public String getColumnText(Object element, int columnIndex) {
		Record r = (Record) element;
		if (columnIndex == columnNumIndx)
			return "" + r.getNum();
		// return
		if (type == BMModel.RELATION)
			return r.getStringNotNull(RelationViewer.COLUMN_PROPERTIES[columnIndex]);
		return "";
	}

	public Image getImage(Object element) {
		// TODO Auto-generated method stub
		return null;
	}

	public String getText(Object element) {
		Record r = (Record) element;
		return r.getPrompt();
	}
}