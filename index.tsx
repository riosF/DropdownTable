import { Select, Table, Input, message, TablePaginationConfig } from "antd";
import { useRef, useState, useEffect } from "react";
import * as React from "react";
// import type { PaginationConfig } from "antd";

const { Search } = Input;

export interface PaginationConfig {
  total?: number;
  defaultCurrent?: number;
  disabled?: boolean;
  current?: number;
  defaultPageSize?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize?: number) => void;
  hideOnSinglePage?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  onShowSizeChange?: (current: number, size: number) => void;
  showQuickJumper?:
    | boolean
    | {
        goButton?: React.ReactNode;
      };
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  simple?: boolean;
  style?: React.CSSProperties;
  locale?: Object;
  className?: string;
  prefixCls?: string;
  selectPrefixCls?: string;
  itemRender?: (
    page: number,
    type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
    originalElement: React.ReactElement<HTMLElement>
  ) => React.ReactNode;
  role?: string;
  showLessItems?: boolean;
  [key: string]: any;
}

export type DropdownTableProps<T, D> = {
  columns?: T[]; // table列配置
  mode?: "radio" | "checkbox"; // 单选 多选
  placeholder?: string | ""; // placeholder
  optionValueProp?: string | "value";
  optionLabelProp?: string | "label";
  searchPlaceholder?: string | ""; // 搜索框的searchPlaceholder
  limit?: number | undefined; //限制最多选择几个
  onChange?: (value: string[]) => void; // 选择值改变后
  dropdownStyle?: React.CSSProperties; // 下拉框样式
  defaultOptions?: { value: string; label: string }[]; // 设置默认选项，在需要回填时使用
  value?: string[] | string; // 设置值
  tableProps?: {
    dataSource: D[];
    loading: boolean;
    onChange?: (
      pagination?: TablePaginationConfig,
      filters?: any,
      sorter?: any
    ) => void;
    pagination?: TablePaginationConfig | false;
    [key: string]: any;
  }; // table的参数
  onSearch?: (keyword: string) => void;
};

const DropdownTable = <
  T extends Record<string, any>,
  D extends Record<string, any>
>({
  columns,
  mode = "radio",
  placeholder = "",
  optionValueProp = "value",
  optionLabelProp = "label",
  searchPlaceholder = "",
  limit,
  onChange,
  dropdownStyle,
  defaultOptions,
  value,
  tableProps,
  onSearch,
}: DropdownTableProps<T, D>) => {
  const ref = useRef<any>();
  const [thisSelectedRowKeys, setThisSelectedRowKeys] = useState<string[]>([]);
  const [selectedRowObjects, setSelectedRowObjects] = useState<
    { value: string; label: string }[]
  >([]);
  const [keyword, setKeyword] = useState<string>("");
  const [searchTag, setSearchTag] = useState<number>(1);

  useEffect(() => {
    if (typeof value === "string") {
      setThisSelectedRowKeys([value]);
      return;
    }
    setThisSelectedRowKeys(value || []);
  }, [value]);

  useEffect(() => {
    setSelectedRowObjects((old) => {
      if (defaultOptions) {
        return [...old, ...defaultOptions];
      }
      return [...old];
    });
  }, [defaultOptions]);

  const listenDataToCallBack = (
    keys: string[],
    objects: { value: string; label: string }[]
  ) => {
    setThisSelectedRowKeys(keys);
    setSelectedRowObjects(objects);
    onChange?.(keys);
  };

  const rowChangeBackArray = (key: string) => {
    if (mode !== "checkbox") {
      return [key];
    }
    const index = thisSelectedRowKeys.indexOf(key);
    const newArray = [...thisSelectedRowKeys];
    if (index === -1) {
      newArray.push(key);
    } else {
      newArray.splice(index, 1);
    }
    return newArray;
  };

  const rowObjectChangeBackArray = (valueString: string, label: string) => {
    if (mode !== "checkbox") {
      return [{ value: valueString, label }];
    }
    const index = thisSelectedRowKeys.indexOf(valueString);
    const newArray = [...selectedRowObjects];
    if (index === -1) {
      newArray.push({ value: valueString, label });
    } else {
      newArray.splice(index, 1);
    }
    return newArray;
  };

  const clickRow = (record: D) => {
    if (mode === "radio") {
      ref.current.selectRef.current.blur();
    }

    const key = record[optionValueProp];
    const newArray = rowChangeBackArray(key);
    const newObjectArray = rowObjectChangeBackArray(
      key,
      record[optionLabelProp]
    );

    if (limit && newArray.length > limit) {
      message.info(`最多只能选择${limit}个`);
      return;
    }
    listenDataToCallBack(newArray, newObjectArray);
  };

  const onSelectAllTable = (
    changeRows: any[],
    selected: boolean,
    selectData: any[],
    id: string,
    isRow: boolean
  ): string[] => {
    const selectCode = [...selectData];
    if (selected) {
      for (let index = 0; index < changeRows.length; index++) {
        const element = changeRows[index];
        if (isRow) {
          selectCode.push(element);
        } else {
          selectCode.push(element[id]);
        }
      }
      return selectCode;
    }
    const result = [];
    for (let i = 0; i < selectCode.length; i++) {
      let k = 0;
      const item = isRow ? selectCode[i][id] : selectCode[i];
      for (let j = 0; j < changeRows.length; j++) {
        if (item !== changeRows[j][id]) {
          k += 1;
          if (k === changeRows.length) {
            result.push(selectCode[i]);
          }
        }
      }
    }
    return result;
  };

  // rowSelection
  const rowSelection = {
    type: mode,
    selectedRowKeys: thisSelectedRowKeys,
    onSelect: (
      record: T,
      selected: boolean,
      selectedRows: string[],
      nativeEvent: React.TouchEvent
    ) => {
      nativeEvent.stopPropagation();
      const key = record[optionValueProp];
      const label = record[optionLabelProp];
      const newArray = rowChangeBackArray(key);
      const newObjectArray = rowObjectChangeBackArray(key, label);
      if (limit && newArray.length > limit) {
        message.info(`最多只能选择${limit}个`);
        return;
      }
      listenDataToCallBack(newArray, newObjectArray);
    },
    onSelectAll: (
      selected: boolean,
      selectedRows: string[],
      changeRows: any[]
    ) => {
      const newKeys = onSelectAllTable(
        changeRows,
        selected,
        thisSelectedRowKeys,
        optionValueProp,
        false
      );
      if (limit && newKeys.length > limit) {
        message.info(`最多只能选择${limit}个`);
        return;
      }
      const newArray = [...selectedRowObjects];
      if (selected) {
        for (let i = 0; i < changeRows.length; i++) {
          const item = changeRows[i];
          const valueString = item[optionValueProp];
          if (thisSelectedRowKeys.indexOf(valueString) === -1) {
            const label = item[optionLabelProp];
            newArray.push({ label, value: valueString });
          }
        }
      } else {
        for (let i = 0; i < changeRows.length; i++) {
          const item = changeRows[i];
          const valueString = item[optionValueProp];
          const index = thisSelectedRowKeys.indexOf(valueString);
          if (index !== -1) {
            newArray.splice(index, 1);
          }
        }
      }
      listenDataToCallBack(newKeys, newArray);
    },
  };

  const getRowSelection = (): any => {
    if (mode === "radio") {
      return {
        columnWidth: 0,
        type: mode,
        renderCell: () => "",
        selectedRowKeys: thisSelectedRowKeys,
      };
    }
    return rowSelection;
  };

  const handleChange = (v: string[]) => {
    setThisSelectedRowKeys(v);
    onChange?.(v);
  };

  return (
    <>
      <Select
        ref={ref}
        placeholder={placeholder}
        showSearch={false}
        allowClear
        showArrow
        onChange={handleChange}
        style={{ width: "100%" }}
        options={selectedRowObjects}
        mode="multiple"
        onClear={() => {
          listenDataToCallBack([], []);
        }}
        // tagRender={tagRender}
        value={thisSelectedRowKeys}
        dropdownStyle={dropdownStyle}
        dropdownRender={() => {
          return (
            <div style={{ ...dropdownStyle, padding: 12 }}>
              <Search
                value={keyword}
                placeholder={searchPlaceholder}
                style={{
                  marginBottom: 12,
                }}
                allowClear
                onSearch={() => {
                  setSearchTag(searchTag + 1);
                }}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setKeyword("");
                    onSearch?.("");
                    setSearchTag(searchTag + 1);
                    return;
                  }
                  setKeyword(e.target.value);
                  onSearch?.(e.target.value);
                }}
                enterButton
              />
              <Table
                {...tableProps}
                onRow={(record) => ({
                  onClick: () => {
                    clickRow(record);
                  },
                })}
                size="small"
                rowSelection={{ ...getRowSelection() }}
                columns={columns}
                rowKey={optionValueProp}
              />
            </div>
          );
        }}
      />
    </>
  );
};

export default DropdownTable;
