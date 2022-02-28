<div>
  <h1>dropdown-table</h1>
  <p>
    <br />
    <strong>下拉列表选择框（带分页、搜索）v0.0.8新增Size参数 为保持与Select尽可能一致</strong>
    <div>修复无antd项目也可以使用该组件，新增size,open参数</div>
  </p>
</div>

<hr />

## Installation

```
yarn add dropdown-table
// or
npm i dropdown-table
```

![01.gif](https://github.com/riosF/DropdownTable/blob/main/demo/01.gif) ![02.gif](https://github.com/riosF/DropdownTable/blob/main/demo/02.gif) ![03.gif](https://github.com/riosF/DropdownTable/blob/main/demo/03.gif)

<div class="markdown"><h2 id="dropdowntable"><a aria-hidden="true" tabindex="-1" href="/components/dropdown-table#dropdowntable"><span class="icon icon-link"></span></a>DropdownTable</h2><h2 id="api"><a aria-hidden="true" tabindex="-1" href="/components/dropdown-table#api"><span class="icon icon-link"></span></a>API</h2><table style="margin-top: 24px;"><thead><tr><th>Name</th><th>Description</th><th>Type</th><th>Default</th></tr></thead><tbody><tr><td>columns</td><td>table列配置</td><td><code>ColumnsType&lt;any&gt;</code></td><td><code>--</code></td></tr><tr><td>mode</td><td>单选 多选</td><td><code>"radio" | "checkbox"</code></td><td><code>radio</code></td></tr><tr><td>placeholder</td><td>选择框默认文本</td><td><code>string</code></td><td><code>--</code></td></tr><tr><td>optionValueProp</td><td>选择框的value</td><td><code>string</code></td><td><code>value</code></td></tr><tr><td>optionLabelProp</td><td>回填到选择框的 Option 的属性值，默认是 Option 的子元素。
比如在子元素需要高亮效果时，
此值可以设为 value</td><td><code>string</code></td><td><code>label</code></td></tr><tr><td>searchPlaceholder</td><td>搜索框默认文本</td><td><code>string</code></td><td><code>--</code></td></tr><tr><td>limit</td><td>限制最多选择几个</td><td><code>number</code></td><td><code>--</code></td></tr><tr><td>onChange</td><td>value 变化时，调用此函数</td><td><code>(value: string[]) =&gt; void</code></td><td><code>--</code></td></tr><tr><td>dropdownStyle</td><td>下拉框样式</td><td><code>CSSProperties</code></td><td><code>--</code></td></tr><tr><td>defaultOptions</td><td>设置默认选项，在需要回填时使用</td><td><code>{ value: string; label: string; }[]</code></td><td><code>--</code></td></tr><tr><td>value</td><td>设置值</td><td><code>string[]</code></td><td><code>--</code></td></tr><tr><td>tableProps</td><td>下拉表的table的参数props</td><td><code>{ [key: string]: any; dataSource: T[]; loading: boolean; onChange?: (pagination?: TablePaginationConfig, filters?: any, sorter?: any) =&gt; void; pagination?: false | TablePaginationConfig; }</code></td><td><code>--</code></td></tr><tr><td>onSearch</td><td>搜索时调用此函数</td><td><code>(keyword: string) =&gt; void</code></td><td><code>--</code></td></tr><tr><td>disabled</td><td>是否禁用</td><td><code>boolean</code></td><td><code>--</code></td></tr><tr><td>disableKeys</td><td>cell禁用的keys</td><td><code>string[]</code></td><td><code>--</code></td></tr><tr><td>isHiddenSearchBar</td><td>是否隐藏搜索栏</td><td><code>boolean</code></td><td><code>--</code></td></tr><tr><td>onSelect</td><td>选择回调函数</td><td><code>(value: string[], data: T[], record: T | T[]) =&gt; void</code></td><td><code>--</code></td></tr><tr><td>maxTagCount</td><td>最多显示多少个 tag，响应式模式会对性能产生损耗</td><td><code>number | "responsive"</code></td><td><code>1</code></td></tr><tr><td>allowClear</td><td>支持清除</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td>showArrow</td><td>是否显示下拉小箭头</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td>size</td><td>选择框大小</td><td><code>SizeType</code></td><td><code>--</code></td></tr><tr><td>open</td><td>是否展开下拉框</td><td><code>boolean</code></td><td><code>--</code></td></tr></tbody></table><p>Demo:</p></div>

Demo:

```tsx
import React from 'react';
import { DropdownTable } from 'DropdownTable';
import { useAntdTable } from 'ahooks';
import { Button, Form, message } from 'antd';
import { useState } from 'react';
import 'antd/dist/antd.css';

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
