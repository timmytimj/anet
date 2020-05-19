import ValuesListAggregation from "components/aggregations/ValuesListAggregation"
import ReportsByTaskAggregation from "components/aggregations/ReportsByTaskAggregation"
import CountPerValueAggregation from "components/aggregations/CountPerValueAggregation"
import { CUSTOM_FIELD_TYPE } from "components/Model"

export const AGGREGATION_TYPE = {
  REPORTS_BY_TASK: "countReportsByTask",
  COUNT_PER_VALUE: "countPerValue",
  VALUES_LIST: "valuesList"
}

export const DEFAULT_AGGREGATION_TYPE_PER_FIELD_TYPE = {
  [CUSTOM_FIELD_TYPE.TEXT]: AGGREGATION_TYPE.VALUES_LIST,
  [CUSTOM_FIELD_TYPE.NUMBER]: AGGREGATION_TYPE.VALUES_LIST,
  [CUSTOM_FIELD_TYPE.DATE]: AGGREGATION_TYPE.VALUES_LIST,
  [CUSTOM_FIELD_TYPE.DATETIME]: AGGREGATION_TYPE.VALUES_LIST,
  [CUSTOM_FIELD_TYPE.ENUM]: AGGREGATION_TYPE.COUNT_PER_VALUE,
  [CUSTOM_FIELD_TYPE.ENUMSET]: AGGREGATION_TYPE.COUNT_PER_VALUE,
  [CUSTOM_FIELD_TYPE.ARRAY_OF_OBJECTS]: AGGREGATION_TYPE.VALUES_LIST,
  [CUSTOM_FIELD_TYPE.SPECIAL_FIELD]: AGGREGATION_TYPE.VALUES_LIST
}

export const AGGREGATION_TYPE_COMPONENTS = {
  [AGGREGATION_TYPE.REPORTS_BY_TASK]: ReportsByTaskAggregation,
  [AGGREGATION_TYPE.COUNT_PER_VALUE]: CountPerValueAggregation,
  [AGGREGATION_TYPE.VALUES_LIST]: ValuesListAggregation
}
