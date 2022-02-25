---
nav:
  title: Components
  path: /components
---

## DropdownTable

<API></API>

Demo:

```tsx
import React from 'react';
import { DropdownTable } from 'DropdownTable';
import { useAntdTable } from 'ahooks';
import { Button, Form, message } from 'antd';
import { useState } from 'react';

const columns = [
  {
    title: '用户名',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
];

const names = ['张', '李', '陈', '荀', '诸葛', '牛', '刘'];
const dataSource: { name: string; id: string }[] = [];
for (let i = 0; i < 20; i++) {
  const index = Math.floor(Math.random() * names.length);
  dataSource.push({
    name: `${names[index]}${i + 1}`,
    id: `${i + 1}`,
  });
}

const getData = (current: number, pageSize: number, searchKey?: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (current - 1) * pageSize;
      const array: { name: string; id: string }[] = [];

      if (searchKey) {
        array.push(...[...dataSource].filter((rs) => rs.name.indexOf(searchKey) !== -1));
        if (array.length > 5) {
          resolve({
            total: array.length,
            list: [...array].splice(start, pageSize),
          });
        } else {
          resolve({
            total: array.length,
            list: array,
          });
        }
      } else {
        array.push(...[...dataSource].splice(start, pageSize));
        resolve({
          total: 20,
          list: array,
        });
      }
    }, 1000);
  });
};

export default () => {
  const [form] = Form.useForm();

  const [searchKey, setSearchKey] = useState('');

  const { tableProps } = useAntdTable<
    {
      total: number;
      list: { name: string; id: string }[];
    },
    { name: string; id: string },
    { name: string; id: string }
  >(
    (rs) => {
      const { current, pageSize } = rs;
      console.log('res', rs);

      // console.log("current:", current, pageSize);
      return getData(current, pageSize, searchKey);
    },
    {
      refreshDeps: [searchKey],
      defaultPageSize: 5,
      formatResult: (res) => {
        return res;
      },
    },
  );

  return (
    <div className="custom-component-page">
      <div className="custom-component-page__demo">
        普通单选用法：
        <DropdownTable
          columns={columns}
          mode="radio"
          size=""
          placeholder="点击选择用户"
          searchPlaceholder="请输入用户名或者姓名搜索"
          optionValueProp="id"
          optionLabelProp="name"
          onChange={(selectedKeys) => {
            console.log('selectedKeys:', selectedKeys);
          }}
          tableProps={{ ...(tableProps as any) }}
          dropdownStyle={{ minWidth: 360 }} // 设置下拉表最小宽度，此处设置width无效必须设置minWidth
        />
      </div>
      <div className="custom-component-page__demo">
        普通多选用法：
        <DropdownTable
          open={true}
          columns={columns}
          mode="checkbox"
          placeholder="点击选择用户"
          searchPlaceholder="请输入用户名或者姓名搜索"
          optionValueProp="id"
          optionLabelProp="name"
          onChange={(selectedKeys) => {
            console.log('selectedKeys:', selectedKeys);
          }}
          tableProps={{ ...(tableProps as any) }}
          dropdownStyle={{ minWidth: 360 }} // 设置下拉表最小宽度，此处设置width无效必须设置minWidth
        />
      </div>
      <div className="custom-component-page__demo">
        <Form
          onFinish={(values) => {
            console.log('values:', values);
            message.info(`获取到表单数据${JSON.stringify(values)}`);
          }}
          form={form}
          initialValues={{ table: ['3', '4'] }}
        >
          <Form.Item label="form设置初始值" name="table">
            <DropdownTable
              columns={columns}
              defaultOptions={[...dataSource]
                .map((rs) => {
                  return { value: rs.id, label: rs.name };
                })
                .splice(2, 2)}
              mode="checkbox"
              maxTagCount="responsive"
              placeholder="点击选择用户"
              searchPlaceholder="请输入用户名或者姓名搜索"
              optionValueProp="id"
              optionLabelProp="name"
              disableKeys={['1', '8']}
              onChange={(selectedKeys) => {
                console.log('selectedKeys:', selectedKeys);
              }}
              onSearch={(keyword) => {
                setSearchKey(keyword);
              }}
              tableProps={{ ...(tableProps as any) }}
              dropdownStyle={{ minWidth: 360 }} // 设置下拉表最小宽度，此处设置width无效必须设置minWidth
            />
          </Form.Item>
        </Form>
        <Button
          onClick={() => {
            form.submit();
          }}
        >
          提交
        </Button>
      </div>
    </div>
  );
};
```
