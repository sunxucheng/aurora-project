package aurora.ide.meta.gef.designer;

import java.util.ArrayList;

import uncertain.composite.CompositeMap;
import aurora.ide.meta.gef.designer.model.Record;

public class DesignerUtil implements IDesignerConst {
	public static final ArrayList<Object[]> typeMap = new ArrayList<Object[]>();
	static {
		typeMap.add(new Object[] { DesignerMessages.DesignerUtil_0,
				DataType.INTEGER });
		typeMap.add(new Object[] { DesignerMessages.DesignerUtil_1,
				DataType.FLOAT });
		typeMap.add(new Object[] { DesignerMessages.DesignerUtil_2,
				DataType.DATE });
		typeMap.add(new Object[] { DesignerMessages.DesignerUtil_3,
				DataType.DATE_TIME });
		typeMap.add(new Object[] { DesignerMessages.DesignerUtil_4,
				DataType.LONG_TEXT });
		typeMap.add(new Object[] { DesignerMessages.DesignerUtil_5,
				DataType.LOOPUPCODE });
		// the final pattern
		typeMap.add(new Object[] { ".*", DataType.TEXT });
	}

	public static Record createRecord(String prompt) {
		Record r = new Record();
		r.put(COLUMN_PROMPT, prompt);
		DataType dt = DataType.TEXT;
		for (Object[] ss : typeMap) {
			if (prompt.matches((String) ss[0])) {
				dt = (DataType) ss[1];
				break;
			}
		}
		r.put(COLUMN_NAME, "");
		r.put(COLUMN_TYPE, dt.getDisplayType());
		r.put(COLUMN_EDITOR, dt.getDefaultEditor());
		r.put(COLUMN_QUERY_OP, dt.getDefaultOperator());
		r.put(COLUMN_QUERYFIELD, false);
		r.put(COLUMN_ISFOREIGN, false);
		// r.put(COLUMN_OPTIONS, "");
		r.setForInsert(true);
		r.setForUpdate(true);
		return r;
	}

	public static Record createRecord(CompositeMap bmField) {
		Record r = new Record();
		r.setName(bmField.getString("name"));
		String pt = bmField.getString("prompt");
		if (pt != null)
			r.setPrompt(pt);
		DataType type = DataType.TEXT;
		String datatype = BMCompositeMap.getMapAttribute(bmField, "datatype");
		if ("java.util.Date".equals(datatype))
			type = DataType.DATE;
		for (DataType dt : DataType.values()) {
			if (dt.getJavaType().equals(datatype)) {
				type = dt;
				break;
			}
		}
		r.put(COLUMN_TYPE, type.getDisplayType());
		r.put(COLUMN_EDITOR, type.getDefaultEditor());
		r.put(COLUMN_QUERY_OP, type.getDefaultOperator());
		r.put(COLUMN_QUERYFIELD, false);
		r.put(COLUMN_ISFOREIGN, false);
		r.setForInsert(true);
		r.setForUpdate(true);
		return r;
	}
}
