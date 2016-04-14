package aurora.plugin.hec.export;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

public class SqlExcelExporter implements IExporter {

	SXSSFWorkbook wb;

	public SqlExcelExporter() {
		wb = new SXSSFWorkbook();
	}

	@Override
	public Workbook doExport(Object dataSet, List<String> promptList)
			throws SQLException {
		SXSSFWorkbook wb = new SXSSFWorkbook(100);
		Sheet sh = wb.createSheet();
		Map<String, CellStyle> styles = createStyles(wb);
		int rowIndex = 0;
		Row headRow = sh.createRow(0);
		int columnLength = promptList.size();
		int columnIndex = 0;

		for (Object promptObj : promptList) {
			String prompt = (String) promptObj;
			Cell promptCell = headRow.createCell(promptList.indexOf(promptObj));
			promptCell.setCellValue(prompt);
			sh.setColumnWidth(columnIndex, 20 * 256);
			promptCell.setCellStyle(styles.get("header"));
			columnIndex++;
		}
		ResultSet rs = (ResultSet) dataSet;
		while (rs.next()) {
			rowIndex++;
			Row valueRow = sh.createRow(rowIndex);
			for (int i = 0; i < columnLength; i++) {
				Cell valueCell = valueRow.createCell(i);
				String cellValue = rs.getString(i + 1);
				valueCell.setCellValue(cellValue);
				valueCell.setCellStyle(styles.get("cell_normal_centered"));
			}
		}
		return wb;
	}

	@Override
	public void dispose() {
		wb.dispose();
	}

	private static Map<String, CellStyle> createStyles(Workbook wb) {
		Map<String, CellStyle> styles = new HashMap<String, CellStyle>();
		DataFormat df = wb.createDataFormat();

		CellStyle style;
		Font headerFont = wb.createFont();
		headerFont.setFontName("Consolas");
		headerFont.setFontHeightInPoints((short) 10);
		headerFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE
				.getIndex());
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setFont(headerFont);
		styles.put("header", style);

		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE
				.getIndex());
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setFont(headerFont);
		style.setDataFormat(df.getFormat("d-mmm"));
		styles.put("header_date", style);

		Font font1 = wb.createFont();
		font1.setBoldweight(Font.BOLDWEIGHT_BOLD);
		font1.setFontName("Consolas");
		font1.setFontHeightInPoints((short) 10);
		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setFont(font1);
		styles.put("cell_b", style);

		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setFont(font1);
		styles.put("cell_b_centered", style);

		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_RIGHT);
		style.setFont(font1);
		style.setDataFormat(df.getFormat("d-mmm"));
		styles.put("cell_b_date", style);

		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_RIGHT);
		style.setFont(font1);
		style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setDataFormat(df.getFormat("d-mmm"));
		styles.put("cell_g", style);

		Font font2 = wb.createFont();
		font2.setColor(IndexedColors.BLUE.getIndex());
		font2.setBoldweight(Font.BOLDWEIGHT_BOLD);
		font2.setFontName("Consolas");
		font2.setFontHeightInPoints((short) 10);
		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setFont(font2);
		styles.put("cell_bb", style);

		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_RIGHT);
		style.setFont(font1);
		style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setDataFormat(df.getFormat("d-mmm"));
		styles.put("cell_bg", style);

		Font font3 = wb.createFont();
		font3.setColor(IndexedColors.DARK_BLUE.getIndex());
		font3.setBoldweight(Font.BOLDWEIGHT_BOLD);
		font3.setFontName("Consolas");
		font3.setFontHeightInPoints((short) 10);
		style = createBorderedStyle(wb);
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setFont(font3);
		style.setWrapText(false);
		styles.put("cell_h", style);

		Font font4 = wb.createFont();
		font4.setColor(IndexedColors.BLACK.getIndex());
		font4.setBoldweight(Font.BOLDWEIGHT_NORMAL);
		font4.setFontName("Consolas");
		font4.setFontHeightInPoints((short) 10);
		style = createBorderedStyle(wb);
		style.setFont(font4);
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setWrapText(false);
		styles.put("cell_normal", style);

		style = createBorderedStyle(wb);
		style.setFont(font4);
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setWrapText(false);
		styles.put("cell_normal_centered", style);

		style = createBorderedStyle(wb);
		style.setFont(font4);
		style.setAlignment(CellStyle.ALIGN_RIGHT);
		style.setWrapText(false);
		style.setDataFormat(df.getFormat("d-mmm"));
		styles.put("cell_normal_date", style);

		style = createBorderedStyle(wb);
		style.setFont(font4);
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setIndention((short) 1);
		style.setWrapText(false);
		styles.put("cell_indented", style);

		style = createBorderedStyle(wb);
		style.setFont(font4);
		style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		styles.put("cell_blue", style);

		return styles;
	}

	private static CellStyle createBorderedStyle(Workbook wb) {
		CellStyle style = wb.createCellStyle();
		style.setBorderRight(CellStyle.BORDER_THIN);
		style.setRightBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderBottom(CellStyle.BORDER_THIN);
		style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderLeft(CellStyle.BORDER_THIN);
		style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderTop(CellStyle.BORDER_THIN);
		style.setTopBorderColor(IndexedColors.BLACK.getIndex());
		style.setWrapText(false);
		return style;
	}

}
