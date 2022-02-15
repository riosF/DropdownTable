import { Input, message, Select, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/lib/table/interface';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import './index.less';

const { Search } = Input;

export type DropdownTableProps<T> = {
  /** table列配置 */
  columns?: ColumnsType<any>;
  /** 单选 多选 */
  mode?: 'radio' | 'checkbox';
  /** 选择框默认文本 */
  placeholder?: string | '';
  /** 选择框的value */
  optionValueProp?: string | 'value';
  /** 回填到选择框的 Option 的属性值，默认是 Option 的子元素。
 比如在子元素需要高亮效果时，
 此值可以设为 value */
  optionLabelProp?: string | 'label';
  /** 搜索框默认文本 */
  searchPlaceholder?: string;
  /** 限制最多选择几个 */
  limit?: number | undefined;
  /**  value 变化时，调用此函数 */
  onChange?: (value: string[]) => void;
  /** 下拉框样式 */
  dropdownStyle?: React.CSSProperties;
  /** 设置默认选项，在需要回填时使用 */
  defaultOptions?: {
    value: string;
    label: string;
  }[];
  /** 设置值 */
  value?: string[];
  /** 下拉表的table的参数props */
  tableProps?: {
    dataSource: T[];
    loading: boolean;
    onChange?: (pagination?: TablePaginationConfig, filters?: any, sorter?: any) => void;
    pagination?: TablePaginationConfig | false;
    [key: string]: any;
  };
  /** 搜索时调用此函数 */
  onSearch?: (keyword: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** cell禁用的keys */
  disableKeys?: string[];
  /** 是否隐藏搜索栏 */
  isHiddenSearchBar?: boolean;
  /** 选择回调函数 */
  onSelect?: (value: string[], data: T[], record: T | T[]) => void;
  /** 最多显示多少个 tag，响应式模式会对性能产生损耗 */
  maxTagCount?: number | 'responsive';
  /** 支持清除 */
  allowClear?: boolean;
  /** 是否显示下拉小箭头 */
  showArrow?: boolean;
};

const DropdownTable = <T extends Record<string, any>>({
  columns,
  mode = 'radio',
  placeholder = '',
  optionValueProp = 'value',
  optionLabelProp = 'label',
  searchPlaceholder = '',
  limit,
  onChange,
  tableProps,
  dropdownStyle,
  defaultOptions,
  value,
  isHiddenSearchBar,
  onSelect,
  maxTagCount = 1,
  allowClear = true,
  showArrow = true,
  disableKeys,
  disabled,
}: // disableKeys,
// disableMessage = '该选项无法选择！',
DropdownTableProps<T>) => {
  const ref = useRef<any>();
  const [thisSelectedRowKeys, setThisSelectedRowKeys] = useState<string[]>([]);
  const [selectedRowObjects, setSelectedRowObjects] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [searchTag, setSearchTag] = useState<number>(1);

  const isFirstLoad = useRef(true);
  // 监听value变化
  useEffect(() => {
    // value是否存在
    let newValue: React.SetStateAction<string[]> = [];
    if (value) {
      //是数组直接设置
      if (Array.isArray(value)) {
        newValue = value;
      } else {
        //非数组转成数组
        newValue = [`${value}`];
      }
    }

    setThisSelectedRowKeys(newValue);
    if ((!value || value.length === 0) && isFirstLoad?.current === true) {
      return;
    }
    if (isFirstLoad?.current === true) {
      onChange?.(newValue);
      isFirstLoad.current = false;
    }
  }, [onChange, value]);

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
    objects: { value: string; label: string }[],
    records: T[],
    record: T | T[],
  ) => {
    onSelect?.(keys, records, record);
    setThisSelectedRowKeys(keys);
    setSelectedRowObjects(objects);
    setSelectedRecords(records);
    onChange?.(keys);
  };

  const rowChangeBackArray = (key: string) => {
    if (mode !== 'checkbox') {
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
    if (mode !== 'checkbox') {
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

  const clickRow = (record: T) => {
    if (mode === 'radio') {
      ref?.current?.blur();
    }

    const key = record[optionValueProp];
    const newArray = rowChangeBackArray(key);
    const newObjectArray = rowObjectChangeBackArray(key, record[optionLabelProp]);

    if (limit && newArray.length > limit) {
      message.info(`最多只能选择${limit}个`);
      return;
    }
    let records = [...selectedRecords];
    const selected = thisSelectedRowKeys.indexOf(key);
    if (selected) {
      records.push(record);
    } else {
      records = [...records].filter((rc) => rc[optionValueProp] !== record[optionValueProp]);
    }
    listenDataToCallBack(newArray, newObjectArray, records, record);
  };

  const onSelectAllTable = (
    changeRows: any[],
    selected: boolean,
    selectData: any[],
    id: string,
    isRow: boolean,
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
      nativeEvent: React.TouchEvent,
    ) => {
      if (disableKeys && disableKeys.indexOf(record[optionValueProp]) !== -1) {
        return;
      }

      nativeEvent.stopPropagation();
      const key = record[optionValueProp];
      const label = record[optionLabelProp];
      const newArray = rowChangeBackArray(key);
      const newObjectArray = rowObjectChangeBackArray(key, label);
      if (limit && newArray.length > limit) {
        message.info(`最多只能选择${limit}个`);
        return;
      }
      let records = [...selectedRecords];
      if (selected) {
        records.push(record);
      } else {
        records = [...records].filter((rc) => rc[optionValueProp] !== record[optionValueProp]);
      }

      listenDataToCallBack(newArray, newObjectArray, records, record);
    },
    onSelectAll: (selected: boolean, selectedRows: string[], changeRows: T[]) => {
      const newKeys = onSelectAllTable(
        changeRows,
        selected,
        thisSelectedRowKeys,
        optionValueProp,
        false,
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
      listenDataToCallBack(newKeys, newArray, changeRows, changeRows);
    },
  };

  const getRowSelection = (): any => {
    if (mode === 'radio') {
      return {
        ...(disableKeys
          ? {
              getCheckboxProps: (record: T) => ({
                disabled: disableKeys.indexOf(record[optionValueProp]) !== -1, // Column configuration not to be checked
                name: record.name,
              }),
            }
          : {}),
        columnWidth: 0,
        type: mode,
        renderCell: () => '',
        selectedRowKeys: thisSelectedRowKeys,
      };
    }

    return {
      ...rowSelection,
      ...(disableKeys
        ? {
            getCheckboxProps: (record: T) => ({
              disabled: disableKeys.indexOf(record[optionValueProp]) !== -1, // Column configuration not to be checked
              name: record.name,
            }),
          }
        : {}),
    };
  };

  const handleChange = (val: string[]) => {
    setThisSelectedRowKeys(val ? val : []);
    onChange?.(val ? val : []);
  };

  return (
    <Select
      ref={ref}
      placeholder={placeholder}
      showSearch={false}
      allowClear={allowClear}
      showArrow={showArrow}
      onChange={(val) => {
        handleChange(val);
      }}
      disabled={disabled}
      maxTagCount={maxTagCount}
      style={{ width: '100%' }}
      options={selectedRowObjects}
      mode={mode === 'checkbox' ? 'multiple' : undefined}
      onClear={() => {
        listenDataToCallBack([], [], [], []);
      }}
      value={thisSelectedRowKeys}
      dropdownStyle={dropdownStyle}
      dropdownRender={() => {
        return (
          <div
            style={{ ...dropdownStyle, padding: 12 }}
            className={mode === 'radio' ? 'dropdown-table' : ''}
          >
            {!isHiddenSearchBar && (
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
                  if (e.target.value === '') {
                    setKeyword('');
                    setSearchTag(searchTag + 1);
                    return;
                  }
                  setKeyword(e.target.value);
                }}
                enterButton
              />
            )}
            <Table
              {...tableProps}
              onRow={(record) => ({
                onClick: () => {
                  if (disableKeys && disableKeys.indexOf(record[optionValueProp]) !== -1) {
                    return;
                  }
                  clickRow(record);
                },
              })}
              size="small"
              rowSelection={{ ...getRowSelection() }}
              rowClassName={(record: T) => {
                if (disableKeys && disableKeys?.indexOf(record[optionValueProp]) !== -1) {
                  return 'dropdown-table__disable';
                }
                return '';
              }}
              columns={columns}
              rowKey={optionValueProp}
              scroll={{ y: '50vh' }}
            />
          </div>
        );
      }}
    />
  );
};

export default DropdownTable;
