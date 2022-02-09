import { Select, Table, Input, message, TablePaginationConfig } from 'antd';
import { useRef, useState, useEffect } from 'react';
import * as React from 'react';
import { ColumnsType } from 'antd/lib/table';
import './index.less';
// import type { PaginationConfig } from "antd";

const { Search } = Input;

export type DropdownTableProps<D> = {
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
  defaultOptions?: { value: string; label: string }[];
  /** 设置值 */
  value?: string[];
  /** 下拉表的table的参数props */
  tableProps?: {
    dataSource: D[];
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
};

const DropdownTable = <T extends Record<string, any>, D extends Record<string, any>>({
  columns,
  mode = 'radio',
  placeholder = '',
  optionValueProp = 'value',
  optionLabelProp = 'label',
  searchPlaceholder = '',
  limit,
  onChange,
  dropdownStyle,
  defaultOptions,
  value,
  tableProps,
  onSearch,
  disabled,
  disableKeys,
}: DropdownTableProps<D>) => {
  const ref = useRef<any>();
  const [thisSelectedRowKeys, setThisSelectedRowKeys] = useState<string[]>([]);
  const [selectedRowObjects, setSelectedRowObjects] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [keyword, setKeyword] = useState<string>('');
  const [searchTag, setSearchTag] = useState<number>(1);

  const isFirstLoad = useRef(true);
  // 监听value变化
  useEffect(() => {
    // value是否存在
    if (value) {
      //是数组直接设置
      if (Array.isArray(value)) {
        setThisSelectedRowKeys(value);
      } else {
        //非数组转成数组
        setThisSelectedRowKeys([`${value}`]);
      }
    } else {
      setThisSelectedRowKeys([]);
    }

    if ((!value || value.length === 0) && isFirstLoad?.current === true) {
      return;
    }
    if (isFirstLoad?.current === true) {
      onChange?.(value || []);
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

  const listenDataToCallBack = (keys: string[], objects: { value: string; label: string }[]) => {
    setThisSelectedRowKeys(keys);
    setSelectedRowObjects(objects);
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

  const clickRow = (record: D) => {
    if (mode === 'radio') {
      ref.current.blur();
    }

    const key = record[optionValueProp];
    const newArray = rowChangeBackArray(key);
    const newObjectArray = rowObjectChangeBackArray(key, record[optionLabelProp]);

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
      listenDataToCallBack(newArray, newObjectArray);
    },
    onSelectAll: (selected: boolean, selectedRows: string[], changeRows: any[]) => {
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
      listenDataToCallBack(newKeys, newArray);
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
        style={{ width: '100%' }}
        options={selectedRowObjects}
        mode={mode === 'checkbox' ? 'multiple' : undefined}
        onClear={() => {
          listenDataToCallBack([], []);
        }}
        disabled={disabled}
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
                onChange={(e: any) => {
                  if (e.target.value === '') {
                    setKeyword('');
                    onSearch?.('');
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
                    if (disableKeys && disableKeys.indexOf(record[optionValueProp]) !== -1) {
                      return;
                    }
                    clickRow(record);
                  },
                })}
                size="small"
                rowSelection={{ ...getRowSelection() }}
                rowClassName={(record: D) => {
                  if (disableKeys && disableKeys?.indexOf(record[optionValueProp]) !== -1) {
                    return 'dropdown-table__disable';
                  }
                  return '';
                }}
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
