package aurora.plugin.hec.export;

import java.sql.SQLException;
import java.util.List;

import org.apache.poi.ss.usermodel.Workbook;

public interface IExporter {
	
	public Workbook doExport(Object dataSet, List<String> promptList) throws SQLException;
	
	public void dispose();
}
